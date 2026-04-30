const AtmosphereShader = `precision highp float;

uniform mat4 projectionMatrixInverse;
uniform mat4 viewMatrixInverse;
uniform vec3 uCameraPosition;
uniform vec3 sunDirection;
uniform float cameraFar;
uniform sampler2D depthBuffer;

uniform float planetRadius;
uniform float atmosphereRadius;
uniform int uFrame;
uniform sampler2D blueNoiseTexture;
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
uniform vec3 moonPosition;
uniform float moonRadius;

const float SUN_RADIUS = 1000.0;
const float SUN_DISTANCE = 100000.0;

const int PRIMARY_STEPS = 32;
const int LIGHT_STEPS = 4;

const float PI = 3.14159265;

struct SingleScatteringResult {
  vec3 scatteredLight;
  vec3 viewOpticalDepth;
};

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

float rayleighDensity(vec3 point, vec3 planetCenter) {
  float altitude = length(point - planetCenter) - planetRadius;
  return exp(-max(altitude, 0.0) / max(rayleighScaleHeight, 1e-4));
}

float mieDensity(vec3 point, vec3 planetCenter) {
  float altitude = length(point - planetCenter) - planetRadius;
  return exp(-max(altitude, 0.0) / max(mieScaleHeight, 1e-4));
}

float ozoneDensity(vec3 point, vec3 planetCenter) {
  float altitude = length(point - planetCenter) - planetRadius;
  return max(0.0, 1.0 - abs(altitude - ozoneCenterHeight) / max(ozoneWidth, 1e-4));
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

vec3 sampleMediumDensity(vec3 point, vec3 planetCenter) {
  float densityR = rayleighDensity(point, planetCenter);
  float densityM = mieEnabled ? mieDensity(point, planetCenter) : 0.0;
  float densityO = ozoneEnabled ? ozoneDensity(point, planetCenter) : 0.0;
  return vec3(densityR, densityM, densityO);
}

float sunVisibility(vec3 point) {
  vec3 sunDir = normalize(sunDirection);
  vec3 toMoon = moonPosition - point;
  float moonDist = length(toMoon);

  if (moonDist <= 1e-5) {
    return 1.0;
  }

  vec3 moonDir = normalize(toMoon);
  float angularSep = acos(clamp(dot(sunDir, moonDir), -1.0, 1.0));
  float sunAngularRadius = SUN_RADIUS / SUN_DISTANCE;
  float moonAngularRadius = moonRadius / moonDist;
  float outerEdge = sunAngularRadius + moonAngularRadius;

  if (angularSep >= outerEdge) {
    return 1.0;
  }

  if (moonAngularRadius >= sunAngularRadius) {
    float innerEdge = moonAngularRadius - sunAngularRadius;
    return max(0.075, smoothstep(innerEdge, outerEdge, angularSep));
  }

  float innerEdge = sunAngularRadius - moonAngularRadius;
  float minVisibility = clamp(
    1.0 - (moonAngularRadius * moonAngularRadius) / (sunAngularRadius * sunAngularRadius),
    0.0,
    1.0
  );

  if (angularSep <= innerEdge) {
    return minVisibility;
  }

  return mix(minVisibility, 1.0, smoothstep(innerEdge, outerEdge, angularSep));
}

vec4 lightMarch(vec3 samplePoint, vec3 planetCenter) {
  vec2 sunAtmosphereHit = raySphereIntersect(samplePoint, sunDirection, planetCenter, atmosphereRadius);
  float sunRayLength = sunAtmosphereHit.y;
  float stepSize = sunRayLength / float(LIGHT_STEPS);
  float rayleighOD = 0.0;
  float mieOD = 0.0;
  float ozoneOD = 0.0;

  for (int i = 0; i < LIGHT_STEPS; i++) {
    float t = (float(i) + 0.5) * stepSize;
    vec3 lightSamplePoint = samplePoint + sunDirection * t;
    float altitude = length(lightSamplePoint - planetCenter) - planetRadius;

    if (altitude < 0.0) {
      return vec4(-1.0);
    }

    rayleighOD += rayleighDensity(lightSamplePoint, planetCenter) * stepSize;
    if (mieEnabled) {
      mieOD += mieDensity(lightSamplePoint, planetCenter) * stepSize;
    }
    if (ozoneEnabled) {
      ozoneOD += ozoneDensity(lightSamplePoint, planetCenter) * stepSize;
    }
  }

  return vec4(rayleighOD, mieOD, ozoneOD, sunVisibility(samplePoint));
}

vec3 computeSampleTransmittance(vec3 sunOpticalDepth, vec3 viewOpticalDepth) {
  vec3 tau = rayleighBeta * (sunOpticalDepth.x + viewOpticalDepth.x)
           + mieBetaExt * (sunOpticalDepth.y + viewOpticalDepth.y)
           + ozoneBetaAbs * (sunOpticalDepth.z + viewOpticalDepth.z);
  return exp(-tau);
}

vec3 computeScatteredLight(vec3 rayleighScattering, vec3 mieScattering, float phaseR, float phaseM) {
  return sunIntensity * (
    phaseR * rayleighBeta * rayleighScattering +
    (mieEnabled ? phaseM * mieBeta * mieScattering : vec3(0.0))
  );
}

vec3 computeViewTransmittance(vec3 viewOpticalDepth) {
  return exp(-(
    rayleighBeta * viewOpticalDepth.x +
    mieBetaExt * viewOpticalDepth.y +
    ozoneBetaAbs * viewOpticalDepth.z
  ));
}

vec3 ACESFilm(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

SingleScatteringResult integrateSingleScattering(
  vec3 rayOrigin,
  vec3 rayDir,
  float atmosphereNear,
  float atmosphereFar,
  vec3 planetCenter,
  float jitter
) {
  SingleScatteringResult result;
  float stepSize = (atmosphereFar - atmosphereNear) / float(PRIMARY_STEPS);
  float viewRayleighOD = 0.0;
  float viewMieOD = 0.0;
  float viewOzoneOD = 0.0;
  vec3 totalRayleigh = vec3(0.0);
  vec3 totalMie = vec3(0.0);
  float mu = dot(rayDir, sunDirection);
  float phaseR = rayleighPhase(mu);
  float phaseM = miePhase(mu);

  for (int i = 0; i < PRIMARY_STEPS; i++) {
    float t = atmosphereNear + (float(i) + jitter * 0.33) * stepSize;
    vec3 samplePoint = rayOrigin + rayDir * t;
    vec3 mediumDensity = sampleMediumDensity(samplePoint, planetCenter);
    float densityR = mediumDensity.x;
    float densityM = mediumDensity.y;
    float densityO = mediumDensity.z;

    viewRayleighOD += densityR * stepSize;
    viewMieOD += densityM * stepSize;
    viewOzoneOD += densityO * stepSize;

    vec4 sunOD = lightMarch(samplePoint, planetCenter);
    if (sunOD.x < 0.0) {
      continue;
    }

    vec3 viewOD = vec3(viewRayleighOD, viewMieOD, viewOzoneOD);
    vec3 transmittance = computeSampleTransmittance(sunOD.xyz, viewOD);
    totalRayleigh += densityR * transmittance * stepSize * sunOD.w;
    if (mieEnabled) {
      totalMie += densityM * transmittance * stepSize * sunOD.w;
    }
  }

  result.viewOpticalDepth = vec3(viewRayleighOD, viewMieOD, viewOzoneOD);
  result.scatteredLight = computeScatteredLight(totalRayleigh, totalMie, phaseR, phaseM);
  return result;
}

vec3 sampleStylizedSun(vec3 rayDir) {
  vec3 viewDir = normalize(rayDir);
  vec3 sunDir = normalize(sunDirection);
  float sunAngularRadius = SUN_RADIUS / SUN_DISTANCE;
  float theta = acos(clamp(dot(viewDir, sunDir), -1.0, 1.0));
  float disk = smoothstep(sunAngularRadius * 1.04, sunAngularRadius * 0.96, theta);
  float coronaInner = exp(-theta / max(sunAngularRadius * 5.5, 1e-5));
  float coronaOuter = exp(-theta / max(sunAngularRadius * 8.0, 1e-5));
  vec3 diskRadiance = vec3(16.0 * disk);
  vec3 coronaRadiance = vec3(1.0, 0.95, 0.86) * (2.0 * coronaInner)
                      + vec3(1.0, 0.98, 0.95) * coronaOuter;

  return (diskRadiance + coronaRadiance) * 0.25;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float depth = readDepth(depthBuffer, uv);
  vec3 worldPosition = getWorldPosition(uv, depth);
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDir = normalize(worldPosition - rayOrigin);
  float sceneDepth = logDepthToRayDistance(uv, depth);
  vec3 planetCenter = vec3(0.0);
  bool isBackground = depth >= 1.0 - 1e-7;
  vec2 atmosphereHit = raySphereIntersect(rayOrigin, rayDir, planetCenter, atmosphereRadius);
  vec2 planetHit = raySphereIntersect(rayOrigin, rayDir, planetCenter, planetRadius);
  vec2 moonHit = raySphereIntersect(rayOrigin, rayDir, moonPosition, moonRadius);

  vec3 color = inputColor.rgb;
  float blueNoise = texture2D(blueNoiseTexture, gl_FragCoord.xy / 1024.0).r;

  if (atmosphereHit.x > 0.0 || atmosphereHit.y > 0.0) {
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

    if (moonHit.x > 0.0) {
      atmosphereFar = min(atmosphereFar, moonHit.x);
    }

    if (atmosphereFar > atmosphereNear) {
      float jitter = fract(blueNoise + float(uFrame % 32) / sqrt(0.5));
      SingleScatteringResult scattering = integrateSingleScattering(
        rayOrigin,
        rayDir,
        atmosphereNear,
        atmosphereFar,
        planetCenter,
        jitter
      );

      color *= computeViewTransmittance(scattering.viewOpticalDepth);
      color += scattering.scatteredLight;
    }
  }

  if (isBackground && planetHit.x < 0.0 && moonHit.x < 0.0) {
    color += sampleStylizedSun(rayDir);
  }

  // Tone mapping
  color = ACESFilm(color);

  // Gamma correction
  color = pow(color, vec3(1.0 / 2.2));
  outputColor = vec4(color, 1.0);
}
`;

const AppCode = `import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, SMAA } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { KernelSize, Pass, Resolution, SMAAPreset } from 'postprocessing';
import { Suspense, forwardRef, useMemo, useRef } from 'react';
import * as THREE from 'three';

import atmosphereShader from '!!raw-loader!./atmosphereShader.glsl';
import './scene.css';

const SUN_DISTANCE = 100000.0;
const MOON_RADIUS = 535.0;
const MOON_DISTANCE = 20000.0;

const PLANET = {
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

const fullscreenPassVertexShader = [
  'varying vec2 vUv;',
  'void main() {',
  '  vUv = uv;',
  '  gl_Position = vec4(position, 1.0);',
  '}',
].join('\\n');

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

const createScatteringUniforms = (preset) => ({
  tDiffuse: new THREE.Uniform(null),
  depthBuffer: new THREE.Uniform(null),
  cameraFar: new THREE.Uniform(200000),
  projectionMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
  viewMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
  uCameraPosition: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  sunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
  planetRadius: new THREE.Uniform(preset.planetRadius),
  atmosphereRadius: new THREE.Uniform(preset.atmosphereRadius),
  blueNoiseTexture: new THREE.Uniform(null),
  uFrame: new THREE.Uniform(0),
  mieEnabled: new THREE.Uniform(true),
  ozoneEnabled: new THREE.Uniform(true),
  rayleighScaleHeight: new THREE.Uniform(preset.rayleighScaleHeight),
  rayleighBeta: new THREE.Uniform(preset.rayleighBeta.clone()),
  mieScaleHeight: new THREE.Uniform(preset.mieScaleHeight),
  mieBeta: new THREE.Uniform(preset.mieBeta),
  mieBetaExt: new THREE.Uniform(preset.mieBetaExt),
  mieG: new THREE.Uniform(preset.mieG),
  ozoneCenterHeight: new THREE.Uniform(preset.ozoneCenterHeight),
  ozoneWidth: new THREE.Uniform(preset.ozoneWidth),
  ozoneBetaAbs: new THREE.Uniform(preset.ozoneBetaAbs.clone()),
  sunIntensity: new THREE.Uniform(preset.sunIntensity),
  moonPosition: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  moonRadius: new THREE.Uniform(MOON_RADIUS),
});

class AtmospherePassImpl extends Pass {
  constructor() {
    super('AtmospherePass');
    this.name = 'AtmospherePass';
    this.needsSwap = true;
    this.needsDepthTexture = true;
    this.uniforms = createScatteringUniforms(PLANET);
    this.material = new THREE.ShaderMaterial({
      vertexShader: fullscreenPassVertexShader,
      fragmentShader: atmospherePassFragmentShader,
      uniforms: this.uniforms,
    });
    this.fullscreenMaterial = this.material;
  }

  render(renderer, inputBuffer, outputBuffer) {
    this.uniforms.tDiffuse.value = inputBuffer.texture;
    this.uniforms.depthBuffer.value = inputBuffer.depthTexture;
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
  const atmospherePassRef = useRef(null);
  const orbitRef = useRef(null);
  const lightRef = useRef(null);
  const planetRef = useRef(null);
  const moonRef = useRef(null);
  const markerRef = useRef(null);
  const sunDirection = useMemo(() => new THREE.Vector3(), []);
  const moonPosition = useMemo(() => new THREE.Vector3(), []);

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
      min: -1,
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

  const { moonProgress, moonAzimuth, moonRotation } = useControls('Moon', {
    moonProgress: {
      value: 0.08,
      min: 0,
      max: 1,
      step: 0.001,
      label: 'Orbit',
    },
    moonAzimuth: {
      value: 0.0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Azimuth',
    },
    moonRotation: {
      value: 0.0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Rotation',
    },
  });

  useFrame((state) => {
    const { camera } = state;
    const sunAngle = sunProgress * Math.PI * 2.0;
    const moonAngle = moonProgress * Math.PI * 2.0;

    sunDirection
      .set(
        Math.cos(sunAngle) * Math.sin(sunAzimuth),
        Math.sin(sunAngle),
        Math.cos(sunAngle) * Math.cos(sunAzimuth)
      )
      .normalize();

    moonPosition
      .set(
        Math.cos(moonAngle) * Math.sin(moonAzimuth),
        Math.sin(moonAngle),
        Math.cos(moonAngle) * Math.cos(moonAzimuth)
      )
      .normalize()
      .multiplyScalar(MOON_DISTANCE);

    camera.updateMatrixWorld();

    if (lightRef.current) {
      lightRef.current.position.copy(sunDirection).multiplyScalar(SUN_DISTANCE);
      lightRef.current.intensity = 4.0;
    }

    if (moonRef.current) {
      moonRef.current.position.copy(moonPosition);
      moonRef.current.rotation.set(moonRotation, 0, 0);
    }

    if (markerRef.current) {
      markerRef.current.position.set(0, PLANET.planetRadius + 2, 0);
    }

    if (orbitRef.current) {
      orbitRef.current.target.set(0, PLANET.planetRadius + 2, 0);
      orbitRef.current.update();
    }

    const pass = atmospherePassRef.current;
    if (!pass) return;

    const { uniforms } = pass;
    uniforms.cameraFar.value = camera.far;
    uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
    uniforms.viewMatrixInverse.value = camera.matrixWorld;
    uniforms.uCameraPosition.value = camera.position;
    uniforms.sunDirection.value = sunDirection;
    uniforms.blueNoiseTexture.value = blueNoise;
    uniforms.mieEnabled.value = mieEnabled;
    uniforms.ozoneEnabled.value = ozoneEnabled;
    uniforms.moonPosition.value.copy(moonPosition);

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

      <mesh ref={moonRef} receiveShadow castShadow rotation={[0, -Math.PI / 2, 0]}>
        <icosahedronGeometry args={[MOON_RADIUS, 64]} />
        <meshStandardMaterial color="#b8b8b8" roughness={0.9} />
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

const Eclipse = {
  '/App.js': {
    code: AppCode,
  },
  '/atmosphereShader.glsl': {
    code: AtmosphereShader,
    active: true,
  },
};

export default Eclipse;
