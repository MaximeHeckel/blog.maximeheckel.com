const ConstantsCode = `import * as THREE from 'three';

export const SUN_RADIUS = 500.0;
export const SUN_DISTANCE = 100000.0;

export const TRANSMITTANCE_LUT_WIDTH = 256;
export const TRANSMITTANCE_LUT_HEIGHT = 64;
export const SKY_VIEW_LUT_WIDTH = 1024;
export const SKY_VIEW_LUT_HEIGHT = 512;
export const AERIAL_PERSPECTIVE_RESOLUTION_SCALE = 1.0;

export const PLANET = {
  planetRadius: 6371,
  atmosphereRadius: 6471,
  rayleighScaleHeight: 8.0,
  rayleighBeta: new THREE.Vector3(0.0058, 0.0135, 0.0331),
  mieScaleHeight: 1.2,
  mieBeta: 0.021,
  mieBetaExt: 0.021 * 1.1,
  mieG: 0.758,
  ozoneCenterHeight: 25.0,
  ozoneWidth: 15.0,
  ozoneBetaAbs: new THREE.Vector3(0.00065, 0.00188, 0.000085),
  sunIntensity: 20.0,
  planetSurfaceColor: '#1a4d8f',
};

const createFallbackTexture = (r, g, b, a) => {
  const data = new Uint8Array([r, g, b, a]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
};

export const FALLBACK_TRANSMITTANCE_LUT = createFallbackTexture(255, 255, 255, 255);
export const FALLBACK_SKY_VIEW_LUT = createFallbackTexture(0, 0, 0, 255);
export const FALLBACK_AERIAL_PERSPECTIVE_LUT = createFallbackTexture(0, 0, 0, 255);
`;

const FullscreenVertexShaderCode = `const fullscreenVertexShader = \`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
\`;

export default fullscreenVertexShader;
`;

const TransmittanceLUTShaderCode = `const transmittanceLUTShader = \`
varying vec2 vUv;

uniform float planetRadius;
uniform float atmosphereRadius;
uniform bool mieEnabled;
uniform bool ozoneEnabled;
uniform float rayleighScaleHeight;
uniform vec3 rayleighBeta;
uniform float mieScaleHeight;
uniform float mieBetaExt;
uniform float ozoneCenterHeight;
uniform float ozoneWidth;
uniform vec3 ozoneBetaAbs;

const int TRANSMITTANCE_STEPS = 40;

vec2 raySphereIntersect(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = (rayOrigin - sphereCenter) / sphereRadius;
  float b = dot(oc, rayDir);
  float c = dot(oc, oc) - 1.0;
  float discriminant = b * b - c;

  if (discriminant < -1e-6) {
    return vec2(-1.0, -1.0);
  }

  float sqrtD = sqrt(max(discriminant, 0.0));
  float near = (-b - sqrtD) * sphereRadius;
  float far = (-b + sqrtD) * sphereRadius;

  return vec2(near, far);
}

float rayleighDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return exp(-altitude / rayleighScaleHeight);
}

float mieDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return exp(-altitude / mieScaleHeight);
}

float ozoneDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return max(0.0, 1.0 - abs(altitude - ozoneCenterHeight) / ozoneWidth);
}

void main() {
  float mu = mix(-1.0, 1.0, vUv.x);
  float radius = mix(planetRadius, atmosphereRadius, vUv.y);
  vec3 rayOrigin = vec3(0.0, radius, 0.0);
  float sinTheta = sqrt(max(1.0 - mu * mu, 0.0));
  vec3 rayDir = normalize(vec3(sinTheta, mu, 0.0));
  vec2 atmosphereHit = raySphereIntersect(rayOrigin, rayDir, vec3(0.0), atmosphereRadius);
  vec2 groundHit = raySphereIntersect(rayOrigin, rayDir, vec3(0.0), planetRadius);
  float rayLength = atmosphereHit.y;

  if (rayLength <= 0.0) {
    gl_FragColor = vec4(1.0);
    return;
  }

  if (groundHit.x > 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float stepSize = rayLength / float(TRANSMITTANCE_STEPS);
  float rayleighOD = 0.0;
  float mieOD = 0.0;
  float ozoneOD = 0.0;

  for (int i = 0; i < TRANSMITTANCE_STEPS; i++) {
    float t = (float(i) + 0.5) * stepSize;
    vec3 samplePoint = rayOrigin + rayDir * t;
    rayleighOD += rayleighDensity(samplePoint) * stepSize;
    if (mieEnabled) {
      mieOD += mieDensity(samplePoint) * stepSize;
    }
    if (ozoneEnabled) {
      ozoneOD += ozoneDensity(samplePoint) * stepSize;
    }
  }

  vec3 tau = rayleighBeta * rayleighOD + mieBetaExt * mieOD + ozoneBetaAbs * ozoneOD;
  gl_FragColor = vec4(exp(-tau), 1.0);
}
\`;

export default transmittanceLUTShader;
`;

const SkyViewLUTShaderCode = `const skyViewLUTShader = \`
varying vec2 vUv;

uniform vec3 uCameraPosition;
uniform vec3 sunDirection;
uniform float planetRadius;
uniform float atmosphereRadius;
uniform bool mieEnabled;
uniform bool ozoneEnabled;
uniform float rayleighScaleHeight;
uniform vec3 rayleighBeta;
uniform float mieScaleHeight;
uniform float mieBeta;
uniform float mieBetaExt;
uniform float mieG;
uniform float ozoneCenterHeight;
uniform float ozoneWidth;
uniform vec3 ozoneBetaAbs;
uniform float sunIntensity;
uniform sampler2D transmittanceLUT;

const int SKY_VIEW_STEPS = 32;
const float PI = 3.14159265;

vec2 raySphereIntersect(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = (rayOrigin - sphereCenter) / sphereRadius;
  float b = dot(oc, rayDir);
  float c = dot(oc, oc) - 1.0;
  float discriminant = b * b - c;

  if (discriminant < -1e-6) {
    return vec2(-1.0, -1.0);
  }

  float sqrtD = sqrt(max(discriminant, 0.0));
  return vec2((-b - sqrtD) * sphereRadius, (-b + sqrtD) * sphereRadius);
}

float rayleighDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return exp(-altitude / rayleighScaleHeight);
}

float mieDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return exp(-altitude / mieScaleHeight);
}

float ozoneDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return max(0.0, 1.0 - abs(altitude - ozoneCenterHeight) / ozoneWidth);
}

vec3 sampleMediumDensity(vec3 point) {
  float densityR = rayleighDensity(point);
  float densityM = mieEnabled ? mieDensity(point) : 0.0;
  float densityO = ozoneEnabled ? ozoneDensity(point) : 0.0;
  return vec3(densityR, densityM, densityO);
}

float rayleighPhase(float mu) {
  return 3.0 / (16.0 * PI) * (1.0 + mu * mu);
}

float miePhase(float mu) {
  float g = mieG;
  float gg = g * g;
  float num = 3.0 * (1.0 - gg) * (1.0 + mu * mu);
  float den = (8.0 * PI) * (2.0 + gg) * pow(max(1.0 + gg - 2.0 * g * mu, 1e-4), 1.5);
  return num / den;
}

vec2 getTransmittanceLUTUv(vec3 samplePoint, vec3 lightDir) {
  vec3 up = normalize(samplePoint);
  float mu = dot(up, lightDir);
  float radius = length(samplePoint);
  float u = mu * 0.5 + 0.5;
  float v = clamp((radius - planetRadius) / max(atmosphereRadius - planetRadius, 1e-5), 0.0, 1.0);
  return vec2(u, v);
}

vec3 sampleTransmittanceLUT(vec3 samplePoint, vec3 lightDir) {
  vec2 uv = getTransmittanceLUTUv(samplePoint, lightDir);
  return texture2D(transmittanceLUT, uv).rgb;
}

vec3 getSkyViewForward(vec3 up) {
  vec3 projectedSun = sunDirection - up * dot(sunDirection, up);
  return normalize(projectedSun);
}

vec3 getSkyViewRayDir(vec2 uv, vec3 up) {
  vec3 forward = getSkyViewForward(up);
  vec3 right = normalize(cross(forward, up));
  float azimuth = (uv.x * 2.0 - 1.0) * PI;
  float elevation = (uv.y * uv.y - 0.5) * PI;
  float cosElevation = cos(elevation);
  vec3 horizontal = cos(azimuth) * forward + sin(azimuth) * right;
  return normalize(horizontal * cosElevation + up * sin(elevation));
}

void main() {
  vec3 rayOrigin = uCameraPosition;
  vec3 up = normalize(rayOrigin);
  vec3 rayDir = getSkyViewRayDir(vUv, up);
  vec3 planetCenter = vec3(0.0);

  vec2 atmosphereHit = raySphereIntersect(rayOrigin, rayDir, planetCenter, atmosphereRadius);
  vec2 planetHit = raySphereIntersect(rayOrigin, rayDir, planetCenter, planetRadius);

  if (atmosphereHit.y <= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float atmosphereNear = max(atmosphereHit.x, 0.0);
  float atmosphereFar = atmosphereHit.y;
  if (planetHit.x > atmosphereNear) {
    atmosphereFar = min(atmosphereFar, planetHit.x);
  }

  float atmosphereSegmentLength = atmosphereFar - atmosphereNear;

  float stepSize = atmosphereSegmentLength / float(SKY_VIEW_STEPS);
  float viewRayleighOD = 0.0;
  float viewMieOD = 0.0;
  float viewOzoneOD = 0.0;
  vec3 totalRayleigh = vec3(0.0);
  vec3 totalMie = vec3(0.0);

  float mu = dot(rayDir, sunDirection);
  float phaseR = rayleighPhase(mu);
  float phaseM = miePhase(mu);

  for (int i = 0; i < SKY_VIEW_STEPS; i++) {
    float t = atmosphereNear + (float(i) + 0.5) * stepSize;
    vec3 samplePoint = rayOrigin + rayDir * t;
    vec3 density = sampleMediumDensity(samplePoint);
    viewRayleighOD += density.x * stepSize;
    viewMieOD += density.y * stepSize;
    viewOzoneOD += density.z * stepSize;

    vec3 sunTransmittance = sampleTransmittanceLUT(samplePoint, sunDirection);
    vec3 viewTau = rayleighBeta * viewRayleighOD + mieBetaExt * viewMieOD + ozoneBetaAbs * viewOzoneOD;
    vec3 transmittance = sunTransmittance * exp(-viewTau);

    totalRayleigh += density.x * transmittance * stepSize;

    if (mieEnabled) {
      totalMie += density.y * transmittance * stepSize;
    }
  }

  vec3 scatteredLight = sunIntensity * (
    phaseR * rayleighBeta * totalRayleigh +
    (mieEnabled ? phaseM * mieBeta * totalMie : vec3(0.0))
  );

  gl_FragColor = vec4(scatteredLight, 1.0);
}
\`;

export default skyViewLUTShader;
`;

const AerialPerspectiveLUTShaderCode = `const aerialPerspectiveLUTShader = \`
varying vec2 vUv;

uniform mat4 projectionMatrixInverse;
uniform mat4 viewMatrixInverse;
uniform vec3 uCameraPosition;
uniform vec3 sunDirection;
uniform float cameraFar;
uniform sampler2D depthBuffer;
uniform sampler2D blueNoiseTexture;
uniform int uFrame;
uniform float planetRadius;
uniform float atmosphereRadius;
uniform bool mieEnabled;
uniform bool ozoneEnabled;
uniform float rayleighScaleHeight;
uniform vec3 rayleighBeta;
uniform float mieScaleHeight;
uniform float mieBeta;
uniform float mieBetaExt;
uniform float mieG;
uniform float ozoneCenterHeight;
uniform float ozoneWidth;
uniform vec3 ozoneBetaAbs;
uniform float sunIntensity;
uniform sampler2D transmittanceLUT;

const int AERIAL_PERSPECTIVE_STEPS = 32;
const float PI = 3.14159265;

float logDepthToViewZ(float depth) {
  float d = pow(2.0, depth * log2(cameraFar + 1.0)) - 1.0;
  return -d;
}

float logDepthToRayDistance(vec2 uv, float depth) {
  float viewZ = logDepthToViewZ(depth);
  vec2 ndc = uv * 2.0 - 1.0;
  vec4 clipAtZ1 = vec4(ndc, -1.0, 1.0);
  vec4 viewAtZ1 = projectionMatrixInverse * clipAtZ1;
  viewAtZ1 /= viewAtZ1.w;
  vec3 viewRayDir = normalize(viewAtZ1.xyz);
  float cosTheta = max(-viewRayDir.z, 1e-5);
  return (-viewZ) / cosTheta;
}

vec3 getWorldPosition(vec2 uv, float depth) {
  float viewZ = logDepthToViewZ(depth);
  vec2 ndc = uv * 2.0 - 1.0;
  vec4 clipAtZ1 = vec4(ndc, -1.0, 1.0);
  vec4 viewAtZ1 = projectionMatrixInverse * clipAtZ1;
  viewAtZ1 /= viewAtZ1.w;
  vec3 viewPos = viewAtZ1.xyz * (viewZ / viewAtZ1.z);
  vec4 world = viewMatrixInverse * vec4(viewPos, 1.0);
  return world.xyz;
}

vec2 raySphereIntersect(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = rayOrigin - sphereCenter;
  float b = dot(oc, rayDir);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  float discriminant = b * b - c;

  if (discriminant < 0.0) {
    return vec2(-1.0, -1.0);
  }

  float sqrtD = sqrt(discriminant);
  return vec2(-b - sqrtD, -b + sqrtD);
}

float rayleighDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return exp(-altitude / rayleighScaleHeight);
}

float mieDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return exp(-altitude / mieScaleHeight);
}

float ozoneDensity(vec3 point) {
  float altitude = length(point) - planetRadius;
  return max(0.0, 1.0 - abs(altitude - ozoneCenterHeight) / ozoneWidth);
}

vec3 sampleMediumDensity(vec3 point) {
  float densityR = rayleighDensity(point);
  float densityM = mieEnabled ? mieDensity(point) : 0.0;
  float densityO = ozoneEnabled ? ozoneDensity(point) : 0.0;
  return vec3(densityR, densityM, densityO);
}

float rayleighPhase(float mu) {
  return 3.0 / (16.0 * PI) * (1.0 + mu * mu);
}

float miePhase(float mu) {
  float g = mieG;
  float gg = g * g;
  float num = 3.0 * (1.0 - gg) * (1.0 + mu * mu);
  float den = (8.0 * PI) * (2.0 + gg) * pow(max(1.0 + gg - 2.0 * g * mu, 1e-4), 1.5);
  return num / den;
}

vec2 getTransmittanceLUTUv(vec3 samplePoint, vec3 lightDir) {
  vec3 up = normalize(samplePoint);
  float mu = dot(up, lightDir);
  float radius = length(samplePoint);
  float u = mu * 0.5 + 0.5;
  float v = clamp((radius - planetRadius) / max(atmosphereRadius - planetRadius, 1e-5), 0.0, 1.0);
  return vec2(u, v);
}

vec3 sampleTransmittanceLUT(vec3 samplePoint, vec3 lightDir) {
    vec2 uv = getTransmittanceLUTUv(samplePoint, lightDir);
    return texture2D(transmittanceLUT, uv).rgb;
}

void main() {
  float depth = texture2D(depthBuffer, vUv).x;
  vec3 rayOrigin = uCameraPosition;
  vec3 worldPosition = getWorldPosition(vUv, depth);
  vec3 rayDir = normalize(worldPosition - rayOrigin);
  float sceneDepth = logDepthToRayDistance(vUv, depth);
  vec2 atmosphereHit = raySphereIntersect(rayOrigin, rayDir, vec3(0.0), atmosphereRadius);
  vec2 planetHit = raySphereIntersect(rayOrigin, rayDir, vec3(0.0), planetRadius);

  if (atmosphereHit.y <= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float atmosphereNear = max(atmosphereHit.x, 0.0);
  float atmosphereFar = atmosphereHit.y;

  if (planetHit.x > 0.0) {
    atmosphereFar = min(atmosphereFar, planetHit.x);
    if (sceneDepth < planetHit.x - 2.0) {
      atmosphereFar = min(atmosphereFar, sceneDepth);
    }
  } else {
    atmosphereFar = min(atmosphereFar, sceneDepth);
  }

  float segmentLength = atmosphereFar - atmosphereNear;
  if (segmentLength <= 1e-5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float blueNoise = texture2D(blueNoiseTexture, gl_FragCoord.xy / 1024.0).r;
  float jitter = fract(blueNoise + float(uFrame % 32) / sqrt(0.5));
  float stepSize = segmentLength / float(AERIAL_PERSPECTIVE_STEPS);
  float viewRayleighOD = 0.0;
  float viewMieOD = 0.0;
  float viewOzoneOD = 0.0;
  vec3 totalRayleigh = vec3(0.0);
  vec3 totalMie = vec3(0.0);
  float mu = dot(rayDir, sunDirection);
  float phaseR = rayleighPhase(mu);
  float phaseM = miePhase(mu);

  for (int i = 0; i < AERIAL_PERSPECTIVE_STEPS; i++) {
    float t = atmosphereNear + (float(i) + jitter * 0.33) * stepSize;
    vec3 samplePoint = rayOrigin + rayDir * t;
    vec3 density = sampleMediumDensity(samplePoint);
    viewRayleighOD += density.x * stepSize;
    viewMieOD += density.y * stepSize;
    viewOzoneOD += density.z * stepSize;
    vec3 sunTransmittance = sampleTransmittanceLUT(samplePoint, sunDirection);

    vec3 viewTau = rayleighBeta * viewRayleighOD + mieBetaExt * viewMieOD + ozoneBetaAbs * viewOzoneOD;
    vec3 transmittance = sunTransmittance * exp(-viewTau);
    totalRayleigh += density.x * transmittance * stepSize;
    if (mieEnabled) {
      totalMie += density.y * transmittance * stepSize;
    }
  }

  vec3 scatteredLight = sunIntensity * (
    phaseR * rayleighBeta * totalRayleigh +
    (mieEnabled ? phaseM * mieBeta * totalMie : vec3(0.0))
  );
  vec3 viewTransmittance = exp(-(rayleighBeta * viewRayleighOD + mieBetaExt * viewMieOD));
  float packedTransmittance = clamp((viewTransmittance.r + viewTransmittance.g + viewTransmittance.b) / 3.0, 0.0, 1.0);

  gl_FragColor = vec4(scatteredLight, packedTransmittance);
}
\`;

export default aerialPerspectiveLUTShader;
`;

const TransmittanceLUTCode = `import { useFBO } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import fullscreenVertexShader from './fullscreenVertexShader';
import transmittanceLUTShader from './TransmittanceLUTShader';
import { PLANET, TRANSMITTANCE_LUT_HEIGHT, TRANSMITTANCE_LUT_WIDTH } from './constants';

export const useTransmittanceLUT = (dpr) => {
  const target = useFBO(
    Math.max(1, Math.floor(TRANSMITTANCE_LUT_WIDTH * dpr)),
    Math.max(1, Math.floor(TRANSMITTANCE_LUT_HEIGHT * dpr)),
    {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }
  );
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const uniforms = useMemo(
    () => ({
      planetRadius: new THREE.Uniform(PLANET.planetRadius),
      atmosphereRadius: new THREE.Uniform(PLANET.atmosphereRadius),
      mieEnabled: new THREE.Uniform(true),
      ozoneEnabled: new THREE.Uniform(true),
      rayleighScaleHeight: new THREE.Uniform(PLANET.rayleighScaleHeight),
      rayleighBeta: new THREE.Uniform(PLANET.rayleighBeta.clone()),
      mieScaleHeight: new THREE.Uniform(PLANET.mieScaleHeight),
      mieBetaExt: new THREE.Uniform(PLANET.mieBetaExt),
      ozoneCenterHeight: new THREE.Uniform(PLANET.ozoneCenterHeight),
      ozoneWidth: new THREE.Uniform(PLANET.ozoneWidth),
      ozoneBetaAbs: new THREE.Uniform(PLANET.ozoneBetaAbs.clone()),
    }),
    []
  );
  const material = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: transmittanceLUTShader,
      uniforms,
    }),
    [uniforms]
  );
  const quad = useMemo(() => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  }, [material, scene]);

  const render = (renderer) => {
    const previousRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(previousRenderTarget);
  };

  return { camera, material, quad, render, scene, target, uniforms };
};
`;

const SkyViewLUTCode = `import { useFBO } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import fullscreenVertexShader from './fullscreenVertexShader';
import skyViewLUTShader from './SkyViewLUTShader';
import {
  FALLBACK_TRANSMITTANCE_LUT,
  PLANET,
  SKY_VIEW_LUT_HEIGHT,
  SKY_VIEW_LUT_WIDTH,
  SUN_DISTANCE,
  SUN_RADIUS,
} from './constants';

export const useSkyViewLUT = (dpr) => {
  const target = useFBO(
    Math.max(1, Math.floor(SKY_VIEW_LUT_WIDTH * dpr)),
    Math.max(1, Math.floor(SKY_VIEW_LUT_HEIGHT * dpr)),
    {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }
  );
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const uniforms = useMemo(
    () => ({
      uCameraPosition: new THREE.Uniform(new THREE.Vector3(0, PLANET.planetRadius + 1, 0)),
      sunDirection: new THREE.Uniform(new THREE.Vector3(0, 1, 0)),
      planetRadius: new THREE.Uniform(PLANET.planetRadius),
      atmosphereRadius: new THREE.Uniform(PLANET.atmosphereRadius),
      mieEnabled: new THREE.Uniform(true),
      ozoneEnabled: new THREE.Uniform(true),
      rayleighScaleHeight: new THREE.Uniform(PLANET.rayleighScaleHeight),
      rayleighBeta: new THREE.Uniform(PLANET.rayleighBeta.clone()),
      mieScaleHeight: new THREE.Uniform(PLANET.mieScaleHeight),
      mieBeta: new THREE.Uniform(PLANET.mieBeta),
      mieBetaExt: new THREE.Uniform(PLANET.mieBetaExt),
      mieG: new THREE.Uniform(PLANET.mieG),
      ozoneCenterHeight: new THREE.Uniform(PLANET.ozoneCenterHeight),
      ozoneWidth: new THREE.Uniform(PLANET.ozoneWidth),
      ozoneBetaAbs: new THREE.Uniform(PLANET.ozoneBetaAbs.clone()),
      sunIntensity: new THREE.Uniform(PLANET.sunIntensity),
      sunRadius: new THREE.Uniform(SUN_RADIUS),
      sunDistance: new THREE.Uniform(SUN_DISTANCE),
      transmittanceLUT: new THREE.Uniform(FALLBACK_TRANSMITTANCE_LUT),
    }),
    []
  );
  const material = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: skyViewLUTShader,
      uniforms,
    }),
    [uniforms]
  );
  const quad = useMemo(() => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  }, [material, scene]);

  const render = (renderer) => {
    const previousRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(previousRenderTarget);
  };

  return { camera, material, quad, render, scene, target, uniforms };
};
`;

const AerialPerspectiveLUTCode = `import { useFBO } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import aerialPerspectiveLUTShader from './AerialPerspectiveLUTShader';
import fullscreenVertexShader from './fullscreenVertexShader';
import {
  AERIAL_PERSPECTIVE_RESOLUTION_SCALE,
  FALLBACK_TRANSMITTANCE_LUT,
  PLANET,
  SUN_DISTANCE,
  SUN_RADIUS,
} from './constants';

export const useAerialPerspectiveLUT = (size, dpr) => {
  const target = useFBO(
    Math.max(1, Math.floor(size.width * dpr * AERIAL_PERSPECTIVE_RESOLUTION_SCALE)),
    Math.max(1, Math.floor(size.height * dpr * AERIAL_PERSPECTIVE_RESOLUTION_SCALE)),
    {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }
  );
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const uniforms = useMemo(
    () => ({
      projectionMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
      viewMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
      uCameraPosition: new THREE.Uniform(new THREE.Vector3()),
      sunDirection: new THREE.Uniform(new THREE.Vector3(0, 1, 0)),
      cameraFar: new THREE.Uniform(200000),
      depthBuffer: new THREE.Uniform(null),
      blueNoiseTexture: new THREE.Uniform(null),
      uFrame: new THREE.Uniform(0),
      planetRadius: new THREE.Uniform(PLANET.planetRadius),
      atmosphereRadius: new THREE.Uniform(PLANET.atmosphereRadius),
      mieEnabled: new THREE.Uniform(true),
      ozoneEnabled: new THREE.Uniform(true),
      rayleighScaleHeight: new THREE.Uniform(PLANET.rayleighScaleHeight),
      rayleighBeta: new THREE.Uniform(PLANET.rayleighBeta.clone()),
      mieScaleHeight: new THREE.Uniform(PLANET.mieScaleHeight),
      mieBeta: new THREE.Uniform(PLANET.mieBeta),
      mieBetaExt: new THREE.Uniform(PLANET.mieBetaExt),
      mieG: new THREE.Uniform(PLANET.mieG),
      ozoneCenterHeight: new THREE.Uniform(PLANET.ozoneCenterHeight),
      ozoneWidth: new THREE.Uniform(PLANET.ozoneWidth),
      ozoneBetaAbs: new THREE.Uniform(PLANET.ozoneBetaAbs.clone()),
      sunIntensity: new THREE.Uniform(PLANET.sunIntensity),
      sunRadius: new THREE.Uniform(SUN_RADIUS),
      sunDistance: new THREE.Uniform(SUN_DISTANCE),
      transmittanceLUT: new THREE.Uniform(FALLBACK_TRANSMITTANCE_LUT),
    }),
    []
  );
  const material = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: aerialPerspectiveLUTShader,
      uniforms,
    }),
    [uniforms]
  );
  const quad = useMemo(() => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  }, [material, scene]);

  return { camera, material, quad, scene, target, uniforms };
};
`;

const AtmosphereShader = `precision highp float;

uniform mat4 projectionMatrixInverse;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrixInverse;
uniform vec3 uCameraPosition;
uniform vec3 sunDirection;
uniform float cameraNear;
uniform float cameraFar;
uniform sampler2D depthBuffer;

uniform float planetRadius;
uniform float atmosphereRadius;

uniform int uFrame;
uniform sampler2D blueNoiseTexture;
uniform sampler2D uNoise;
uniform bool mieEnabled;
uniform bool ozoneEnabled;
uniform float exposure;

uniform float rayleighScaleHeight;
uniform vec3 rayleighBeta;
uniform float mieScaleHeight;
uniform float mieBeta;
uniform float mieBetaExt;
uniform float mieG;
uniform float ozoneCenterHeight;
uniform float ozoneWidth;
uniform vec3 ozoneBetaAbs;
uniform float sunIntensity;
uniform float sunRadius;
uniform float sunDistance;
uniform vec3 planetSurfaceColor;

uniform sampler2D transmittanceLUT;
uniform sampler2D skyViewLUT;
uniform vec2 skyViewTexelSize;
uniform bool skyViewEnabled;
uniform sampler2D aerialPerspectiveLUT;
uniform vec2 aerialPerspectiveTexelSize;
uniform bool aerialPerspectiveEnabled;

const int PRIMARY_STEPS = 32;
const int LIGHT_STEPS = 4;
const float PI = 3.14159265;

vec3 ACESFilm(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

float readDepth(sampler2D depthSampler, vec2 coord) {
  return texture2D(depthSampler, coord).x;
}

float logDepthToViewZ(float depth) {
  float d = pow(2.0, depth * log2(cameraFar + 1.0)) - 1.0;
  return -d;
}

float logDepthToRayDistance(vec2 uv, float depth) {
  float viewZ = logDepthToViewZ(depth);
  vec2 ndc = uv * 2.0 - 1.0;
  vec4 clipAtZ1 = vec4(ndc, -1.0, 1.0);
  vec4 viewAtZ1 = projectionMatrixInverse * clipAtZ1;
  viewAtZ1 /= viewAtZ1.w;
  vec3 viewRayDir = normalize(viewAtZ1.xyz);
  float cosTheta = max(-viewRayDir.z, 1e-5);
  return (-viewZ) / cosTheta;
}

vec3 getWorldPosition(vec2 uv, float depth) {
  float viewZ = logDepthToViewZ(depth);
  vec2 ndc = uv * 2.0 - 1.0;
  vec4 clipAtZ1 = vec4(ndc, -1.0, 1.0);
  vec4 viewAtZ1 = projectionMatrixInverse * clipAtZ1;
  viewAtZ1 /= viewAtZ1.w;
  vec3 viewPos = viewAtZ1.xyz * (viewZ / viewAtZ1.z);
  vec4 world = viewMatrixInverse * vec4(viewPos, 1.0);
  return world.xyz;
}

vec2 raySphereIntersect(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = (rayOrigin - sphereCenter) / sphereRadius;
  float b = dot(oc, rayDir);
  float c = dot(oc, oc) - 1.0;
  float discriminant = b * b - c;

  if (discriminant < -1e-6) {
    return vec2(-1.0, -1.0);
  }

  float sqrtD = sqrt(max(discriminant, 0.0));
  float near = (-b - sqrtD) * sphereRadius;
  float far = (-b + sqrtD) * sphereRadius;

  return vec2(near, far);
}

vec2 getTransmittanceLUTUv(vec3 samplePoint, vec3 lightDir, vec3 planetCenter) {
  vec3 up = normalize(samplePoint - planetCenter);
  float mu = dot(up, lightDir);
  float radius = length(samplePoint - planetCenter);
  float u = mu * 0.5 + 0.5;
  float v = clamp((radius - planetRadius) / max(atmosphereRadius - planetRadius, 1e-5), 0.0, 1.0);
  return vec2(u, v);
}

vec3 sampleTransmittanceLUT(vec3 samplePoint, vec3 lightDir, vec3 planetCenter) {
  vec2 uv = getTransmittanceLUTUv(samplePoint, lightDir, planetCenter);
  return texture2D(transmittanceLUT, uv).rgb;
}

vec3 computeViewOpticalDepthCoefficients(vec3 viewOpticalDepth) {
  return rayleighBeta * viewOpticalDepth.x
       + mieBetaExt * viewOpticalDepth.y
       + ozoneBetaAbs * viewOpticalDepth.z;
}

vec3 computeSampleTransmittance(vec3 sunTransmittance, vec3 viewOpticalDepth) {
  vec3 viewTransmittance = exp(-computeViewOpticalDepthCoefficients(viewOpticalDepth));
  return sunTransmittance * viewTransmittance;
}

vec3 getSkyViewForward(vec3 up) {
  vec3 projectedSun = sunDirection - up * dot(sunDirection, up);
  float projectedSunLenSq = dot(projectedSun, projectedSun);

  if (projectedSunLenSq < 1e-5) {
    vec3 fallbackAxis = abs(up.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    projectedSun = cross(fallbackAxis, up);
  }

  return normalize(projectedSun);
}

vec2 getSkyViewLUTUv(vec3 rayDir, vec3 planetCenter) {
  vec3 up = normalize(uCameraPosition - planetCenter);
  vec3 forward = getSkyViewForward(up);
  vec3 right = normalize(cross(forward, up));
  float vertical = clamp(dot(rayDir, up), -1.0, 1.0);
  vec3 horizontal = rayDir - up * vertical;
  float horizontalLen = length(horizontal);
  float azimuth = atan(dot(horizontal, right), dot(horizontal, forward));
  float elevation = asin(vertical);
  float elevation01 = clamp(elevation / PI + 0.5, 0.0, 1.0);

  return vec2(
    azimuth / (2.0 * PI) + 0.5,
    sqrt(elevation01)
  );
}

vec3 sampleSkyViewLUT(vec3 rayDir, vec3 planetCenter) {
  vec2 uv = getSkyViewLUTUv(rayDir, planetCenter);
  return texture2D(skyViewLUT, uv).rgb;
}

vec4 sampleAerialPerspectiveLUT(vec2 uv) {
  return texture2D(aerialPerspectiveLUT, uv);
}

vec3 sampleStylizedSun(vec3 rayOrigin, vec3 rayDir, vec3 planetCenter) {
  vec3 viewDir = normalize(rayDir);
  vec3 up = normalize(rayOrigin - planetCenter);
  vec3 sunDir = normalize(sunDirection);

  float altitude = length(rayOrigin - planetCenter) - planetRadius;
  float altitude01 = clamp(altitude / max(atmosphereRadius - planetRadius, 1e-5), 0.0, 1.0);
  float sunElevation = dot(sunDir, up);
  float sunAngularRadius = sunRadius / sunDistance;
  float theta = acos(clamp(dot(viewDir, sunDir), -1.0, 1.0));
  float disk = smoothstep(sunAngularRadius * 1.04, sunAngularRadius * 0.96, theta);

  float coronaInner = exp(-theta / max(sunAngularRadius * 5.5, 1e-5));
  float coronaOuter = exp(-theta / max(sunAngularRadius * 8.0, 1e-5));

  vec3 radiance = disk * 16.0
    + vec3(1.0, 0.95, 0.86) * coronaInner * 2.0
    + vec3(1.0, 0.98, 0.95) * coronaOuter;

  float belowHorizonFade = smoothstep(-0.12, 0.04, sunElevation);
  float spaceVisibility = mix(belowHorizonFade, 1.0, altitude01);

  vec3 atmosphereSunTransmittance = sampleTransmittanceLUT(rayOrigin, sunDir, planetCenter);

  float inAtmosphereFactor = 1.0 - smoothstep(0.2, 0.9, altitude01);

  vec3 sunTransmittance = mix(vec3(1.0), atmosphereSunTransmittance, inAtmosphereFactor);

  return radiance * sunIntensity * sunTransmittance * 0.01;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float depth = readDepth(depthBuffer, uv);
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDir = normalize(getWorldPosition(uv, depth) - rayOrigin);
  vec3 planetCenter = vec3(0.0);
  vec2 planetHit = raySphereIntersect(rayOrigin, rayDir, planetCenter, planetRadius);
  vec3 color = inputColor.rgb;
  bool isBackground = depth >= 1.0 - 1e-7;

  if (aerialPerspectiveEnabled && !isBackground) {
    vec4 aerialPerspective = sampleAerialPerspectiveLUT(uv);
    color = color * aerialPerspective.a + aerialPerspective.rgb;
  }

  if (skyViewEnabled && isBackground) {
    vec3 skyViewColor = inputColor.rgb + sampleSkyViewLUT(rayDir, planetCenter);
    color = skyViewColor;
  }

  if (isBackground && planetHit.x < 0.0) {
    color += sampleStylizedSun(rayOrigin, rayDir, planetCenter);
  }

  color = ACESFilm(color);
  color = pow(color, vec3(1.0 / 2.2));

  outputColor = vec4(color, 1.0);
}
`;

const AppCode = `import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Pass } from 'postprocessing';
import { Suspense, forwardRef, useMemo, useRef } from 'react';
import * as THREE from 'three';

import atmosphereShader from '!!raw-loader!./atmosphereShader.glsl';
import { useAerialPerspectiveLUT } from './AerialPerspectiveLUT';
import {
  FALLBACK_AERIAL_PERSPECTIVE_LUT,
  FALLBACK_SKY_VIEW_LUT,
  FALLBACK_TRANSMITTANCE_LUT,
  PLANET,
  SUN_DISTANCE,
  SUN_RADIUS,
} from './constants';
import fullscreenVertexShader from './fullscreenVertexShader';
import { useSkyViewLUT as useSkyViewLUTTarget } from './SkyViewLUT';
import { useTransmittanceLUT } from './TransmittanceLUT';
import './scene.css';

const atmospherePassFragmentShader = [
  'varying vec2 vUv;',
  'uniform sampler2D tDiffuse;',
  atmosphereShader,
  'void main() {',
  '  vec4 outputColor = vec4(0.0);',
  '  mainImage(texture2D(tDiffuse, vUv), vUv, outputColor);',
  '  gl_FragColor = outputColor;',
  '}',
].join('\\n');

const createScatteringUniforms = () => ({
  tDiffuse: new THREE.Uniform(null),
  depthBuffer: new THREE.Uniform(null),
  cameraFar: new THREE.Uniform(200000),
  projectionMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
  viewMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
  uCameraPosition: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  sunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
  planetRadius: new THREE.Uniform(PLANET.planetRadius),
  atmosphereRadius: new THREE.Uniform(PLANET.atmosphereRadius),
  blueNoiseTexture: new THREE.Uniform(null),
  uFrame: new THREE.Uniform(0),
  mieEnabled: new THREE.Uniform(true),
  ozoneEnabled: new THREE.Uniform(true),
  rayleighScaleHeight: new THREE.Uniform(PLANET.rayleighScaleHeight),
  rayleighBeta: new THREE.Uniform(PLANET.rayleighBeta.clone()),
  mieScaleHeight: new THREE.Uniform(PLANET.mieScaleHeight),
  mieBeta: new THREE.Uniform(PLANET.mieBeta),
  mieBetaExt: new THREE.Uniform(PLANET.mieBetaExt),
  mieG: new THREE.Uniform(PLANET.mieG),
  ozoneCenterHeight: new THREE.Uniform(PLANET.ozoneCenterHeight),
  ozoneWidth: new THREE.Uniform(PLANET.ozoneWidth),
  ozoneBetaAbs: new THREE.Uniform(PLANET.ozoneBetaAbs.clone()),
  sunIntensity: new THREE.Uniform(PLANET.sunIntensity),
  sunRadius: new THREE.Uniform(SUN_RADIUS),
  sunDistance: new THREE.Uniform(SUN_DISTANCE),
  transmittanceLUT: new THREE.Uniform(FALLBACK_TRANSMITTANCE_LUT),
  skyViewLUT: new THREE.Uniform(FALLBACK_SKY_VIEW_LUT),
  skyViewTexelSize: new THREE.Uniform(new THREE.Vector2(1, 1)),
  skyViewEnabled: new THREE.Uniform(true),
  aerialPerspectiveLUT: new THREE.Uniform(FALLBACK_AERIAL_PERSPECTIVE_LUT),
  aerialPerspectiveEnabled: new THREE.Uniform(true),
});

class AtmospherePassImpl extends Pass {
  constructor() {
    super('AtmospherePass');
    this.name = 'AtmospherePass';
    this.needsSwap = true;
    this.needsDepthTexture = true;
    this.uniforms = createScatteringUniforms();
    this.material = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: atmospherePassFragmentShader,
      uniforms: this.uniforms,
    });
    this.fullscreenMaterial = this.material;
    this.aerialPerspectiveResources = null;
  }

  setAerialPerspectiveResources(resources) {
    this.aerialPerspectiveResources = resources;
  }

  render(renderer, inputBuffer, outputBuffer) {
    this.uniforms.tDiffuse.value = inputBuffer.texture;
    this.uniforms.depthBuffer.value = inputBuffer.depthTexture;

    if (this.uniforms.aerialPerspectiveEnabled.value && this.aerialPerspectiveResources) {
      const { camera, scene, target, uniforms } = this.aerialPerspectiveResources;
      const previousRenderTarget = renderer.getRenderTarget();
      uniforms.depthBuffer.value = inputBuffer.depthTexture;
      uniforms.transmittanceLUT.value = this.uniforms.transmittanceLUT.value;
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(previousRenderTarget);
      this.uniforms.aerialPerspectiveLUT.value = target.texture;
    }

    renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
    renderer.clear();
    renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.material.dispose();
  }
}

const AtmospherePass = forwardRef((_, ref) => {
  const pass = useMemo(() => new AtmospherePassImpl(), []);

  return <primitive object={pass} ref={ref} dispose={null} />;
});

const AtmosphericScattering = () => {
  const { size, viewport } = useThree();
  const dpr = viewport.dpr;
  const atmospherePassRef = useRef(null);
  const orbitRef = useRef(null);
  const lightRef = useRef(null);
  const planetRef = useRef(null);
  const markerRef = useRef(null);
  const sunDirection = useMemo(() => new THREE.Vector3(), []);
  const transmittanceLUT = useTransmittanceLUT(dpr);
  const skyViewLUT = useSkyViewLUTTarget(dpr);
  const aerialPerspectiveLUT = useAerialPerspectiveLUT(size, dpr);

  const blueNoise = useTexture('https://cdn.maximeheckel.com/noises/blue-noise.png');
  blueNoise.wrapS = THREE.RepeatWrapping;
  blueNoise.wrapT = THREE.RepeatWrapping;
  blueNoise.minFilter = THREE.NearestMipmapLinearFilter;
  blueNoise.magFilter = THREE.NearestFilter;

  const {
    effectsEnabled,
    mieEnabled,
    ozoneEnabled,
  } = useControls({
    effectsEnabled: { value: true, label: 'Enable Effects' },
    mieEnabled: { value: true, label: 'Mie Scattering' },
    ozoneEnabled: { value: true, label: 'Ozone Absorption' },
  });

  const { sunProgress, sunAzimuth } = useControls('Sun', {
    sunProgress: {
      value: 0.15,
      min: 0,
      max: 1,
      step: 0.001,
      label: 'Time of Day',
    },
    sunAzimuth: {
      value: 0.0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Azimuth',
    },
  });

  const { skyViewLUTEnabled, aerialPerspectiveLUTEnabled } = useControls('Debug', {
    skyViewLUTEnabled: { value: true, label: 'Use Sky-View LUT' },
    aerialPerspectiveLUTEnabled: { value: true, label: 'Use Aerial Perspective LUT' },
  });

  useFrame((state) => {
    const { camera, gl } = state;
    const sunAngle = sunProgress * Math.PI * 2.0;

    sunDirection
      .set(
        Math.cos(sunAngle) * Math.sin(sunAzimuth),
        Math.sin(sunAngle),
        Math.cos(sunAngle) * Math.cos(sunAzimuth)
      )
      .normalize();

    camera.updateMatrixWorld();

    if (lightRef.current) {
      lightRef.current.position.copy(sunDirection).multiplyScalar(SUN_DISTANCE);
      lightRef.current.intensity = 4.0;
    }

    if (markerRef.current) {
      markerRef.current.position.set(0, PLANET.planetRadius + 2, 0);
    }

    if (orbitRef.current) {
      orbitRef.current.target.set(0, PLANET.planetRadius + 2, 0);
      orbitRef.current.update();
    }

    transmittanceLUT.uniforms.mieEnabled.value = mieEnabled;
    transmittanceLUT.uniforms.ozoneEnabled.value = ozoneEnabled;
    transmittanceLUT.render(gl);

    skyViewLUT.uniforms.uCameraPosition.value.copy(camera.position);
    skyViewLUT.uniforms.sunDirection.value.copy(sunDirection);
    skyViewLUT.uniforms.mieEnabled.value = mieEnabled;
    skyViewLUT.uniforms.ozoneEnabled.value = ozoneEnabled;
    skyViewLUT.uniforms.transmittanceLUT.value = transmittanceLUT.target.texture;
    skyViewLUT.render(gl);

    aerialPerspectiveLUT.uniforms.cameraFar.value = camera.far;
    aerialPerspectiveLUT.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
    aerialPerspectiveLUT.uniforms.viewMatrixInverse.value = camera.matrixWorld;
    aerialPerspectiveLUT.uniforms.uCameraPosition.value = camera.position;
    aerialPerspectiveLUT.uniforms.sunDirection.value = sunDirection;
    aerialPerspectiveLUT.uniforms.blueNoiseTexture.value = blueNoise;
    aerialPerspectiveLUT.uniforms.mieEnabled.value = mieEnabled;
    aerialPerspectiveLUT.uniforms.ozoneEnabled.value = ozoneEnabled;
    aerialPerspectiveLUT.uniforms.transmittanceLUT.value = transmittanceLUT.target.texture;
    if (Number.isNaN(aerialPerspectiveLUT.uniforms.uFrame.value)) {
      aerialPerspectiveLUT.uniforms.uFrame.value = 0;
    }
    aerialPerspectiveLUT.uniforms.uFrame.value += 1;

    const pass = atmospherePassRef.current;
    if (!pass) return;

    pass.setAerialPerspectiveResources(aerialPerspectiveLUT);
    const { uniforms } = pass;
    uniforms.cameraFar.value = camera.far;
    uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
    uniforms.viewMatrixInverse.value = camera.matrixWorld;
    uniforms.uCameraPosition.value = camera.position;
    uniforms.sunDirection.value = sunDirection;
    uniforms.blueNoiseTexture.value = blueNoise;
    uniforms.mieEnabled.value = mieEnabled;
    uniforms.ozoneEnabled.value = ozoneEnabled;
    uniforms.transmittanceLUT.value = transmittanceLUT.target.texture;
    uniforms.skyViewLUT.value = skyViewLUT.target.texture;
    uniforms.skyViewTexelSize.value.set(
      1 / Math.max(skyViewLUT.target.width, 1),
      1 / Math.max(skyViewLUT.target.height, 1)
    );
    uniforms.skyViewEnabled.value = skyViewLUTEnabled;
    uniforms.aerialPerspectiveLUT.value = aerialPerspectiveLUTEnabled
      ? aerialPerspectiveLUT.target.texture
      : FALLBACK_AERIAL_PERSPECTIVE_LUT;
    uniforms.aerialPerspectiveEnabled.value = aerialPerspectiveLUTEnabled;

    if (Number.isNaN(uniforms.uFrame.value)) {
      uniforms.uFrame.value = 0;
    }
    uniforms.uFrame.value += 1;
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, PLANET.planetRadius + 1, -100]}
        fov={45}
        near={1}
        far={200000}
      />
      <directionalLight ref={lightRef} castShadow intensity={4.0} />

      <mesh ref={planetRef} receiveShadow castShadow>
        <icosahedronGeometry args={[PLANET.planetRadius, 64]} />
        <meshStandardMaterial color={PLANET.planetSurfaceColor} />
      </mesh>

      <mesh ref={markerRef} receiveShadow castShadow position={[0, PLANET.planetRadius + 2, 0]}>
        <torusGeometry args={[1, 0.1, 16, 64]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <EffectComposer enabled={effectsEnabled} multisampling={0}>
        <AtmospherePass ref={atmospherePassRef} />
      </EffectComposer>

      <OrbitControls
        ref={orbitRef}
        target={[0, PLANET.planetRadius + 2, 0]}
        minDistance={10}
        maxDistance={50000}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </>
  );
};

const Scene = () => (
  <>
    <Canvas
      shadows
      gl={{
        alpha: true,
        logarithmicDepthBuffer: true,
        preserveDrawingBuffer: true,
      }}
      dpr={[1, 1.5]}
    >
      <Suspense>
        <color attach="background" args={['#010101']} />
        <ambientLight intensity={0.0} />
        <AtmosphericScattering />
      </Suspense>
    </Canvas>
    <Leva collapsed />
  </>
);

export default Scene;
`;

const LUT = {
  '/App.js': {
    code: AppCode,
  },
  '/AerialPerspectiveLUT.js': {
    code: AerialPerspectiveLUTCode,
  },
  '/SkyViewLUT.js': {
    code: SkyViewLUTCode,
  },
  '/TransmittanceLUT.js': {
    code: TransmittanceLUTCode,
  },
  '/AerialPerspectiveLUTShader.ts': {
    code: AerialPerspectiveLUTShaderCode,
  },
  '/atmosphereShader.glsl': {
    code: AtmosphereShader,
    active: true,
  },
  '/constants.js': {
    code: ConstantsCode,
  },
  '/fullscreenVertexShader.js': {
    code: FullscreenVertexShaderCode,
  },
  '/SkyViewLUTShader.ts': {
    code: SkyViewLUTShaderCode,
  },
  '/TransmittanceLUTShader.ts': {
    code: TransmittanceLUTShaderCode,
  },
};

export default LUT;
