const AtmosphereShader = `precision highp float;

uniform mat4 projectionMatrixInverse;
uniform mat4 viewMatrixInverse;
uniform vec3 uCameraPosition;
uniform float cameraFar;
uniform sampler2D depthBuffer;

uniform vec3 sunPosition;
uniform float observerAltitude;
uniform float atmosphereHeight;
uniform bool mieEnabled;
uniform bool ozoneEnabled;
uniform float rayleighScaleHeight;
uniform vec3 rayleighBeta;
uniform float mieScaleHeight;
uniform float mieBeta;
uniform float mieBetaExt;
uniform float mieG;
uniform vec3 ozoneBetaAbs;
uniform float sunIntensity;
uniform float sunDiscSize;
uniform int uFrame;
uniform sampler2D blueNoiseTexture;

const int PRIMARY_STEPS = 20;
const int LIGHT_STEPS = 1;
const float PI = 3.14159265;

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

float rayleighDensity(float h) {
  return exp(-max(h, 0.0) / max(rayleighScaleHeight, 1e-4));
}

float mieDensity(float h) {
  float altitude = max(h, 0.0);
  float boundaryAerosols = exp(altitude / -max(mieScaleHeight, 1e-4));
  float upperHaze = 0.07 * exp(altitude / -8.0);
  return boundaryAerosols + upperHaze;
}

float ozoneDensity(float h) {
  float x = clamp(h / max(atmosphereHeight, 1e-4), 0.0, 1.0);
  return smoothstep(0.15, 0.45, x) * (1.0 - smoothstep(0.55, 0.9, x));
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

vec3 computeSampleTransmittance(vec3 sunOD, vec3 viewOD) {
  vec3 tau = rayleighBeta * (sunOD.x + viewOD.x)
           + mieBetaExt * (sunOD.y + viewOD.y)
           + ozoneBetaAbs * (sunOD.z + viewOD.z);
  return exp(-tau);
}

vec3 lightMarch(float startHeight, float muSun) {
  float denom = max(muSun + 0.15, 0.04);
  float maxDist = (atmosphereHeight - startHeight) / denom;
  float stepSize = max(maxDist, 0.0) / float(LIGHT_STEPS);
  float odR = 0.0;
  float odM = 0.0;
  float odO = 0.0;

  for (int i = 0; i < LIGHT_STEPS; i++) {
    float t = (float(i) + 0.5) * stepSize;
    float h = startHeight + t * muSun;
    if (h < 0.0 || h > atmosphereHeight) {
      continue;
    }
    odR += rayleighDensity(h) * stepSize;
    if (mieEnabled) odM += mieDensity(h) * stepSize;
    if (ozoneEnabled) odO += ozoneDensity(h) * stepSize;
  }

  return vec3(odR, odM, odO);
}

vec3 ACESFilm(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

float softSunDisc(vec3 viewDir, vec3 sunDir, float discScale) {
  const float BASE_RADIUS = 0.005;
  float radius = BASE_RADIUS * max(discScale, 0.1);
  float theta = acos(clamp(dot(viewDir, sunDir), -1.0, 1.0));

  float core = exp(-pow(theta / max(radius * 0.7, 1e-5), 2.0));
  float limb = smoothstep(radius * 1.3, radius * 0.2, theta);
  float halo = exp(-theta / max(radius * 18.0, 1e-5));
  return core * limb + 0.25 * halo;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float depth = readDepth(depthBuffer, uv);
  vec3 rayOrigin = uCameraPosition;
  vec3 worldPosition = getWorldPosition(uv, depth);
  vec3 rayDir = normalize(worldPosition - rayOrigin);
  vec3 sunDirection = normalize(sunPosition);
  float sunElevation = sunDirection.y;
  float skyLightFactor = smoothstep(-0.16, 0.06, sunElevation);
  float directSunFactor = smoothstep(-0.08, 0.03, sunElevation);
  float skySunIntensity = sunIntensity * skyLightFactor;
  float directSunIntensity = sunIntensity * directSunFactor;

  float sceneDepth = logDepthToRayDistance(uv, depth);
  bool isBackground = depth >= 1.0 - 1e-7;
  if (isBackground) {
    sceneDepth = atmosphereHeight * 8.0;
  }

  float rayStart = 0.0;
  float rayEnd = max(sceneDepth, 0.0);
  float tGround = 1e9;
  if (rayDir.y < -1e-5) {
    tGround = observerAltitude / max(-rayDir.y, 1e-4);
    rayEnd = min(rayEnd, tGround);
  }
  float stepSize = (rayEnd - rayStart) / float(PRIMARY_STEPS);
  float blueNoise = texture2D(blueNoiseTexture, gl_FragCoord.xy / 1024.0).r;
  float jitter = fract(blueNoise + float(uFrame % 32) / sqrt(0.5));

  float viewODR = 0.0;
  float viewODM = 0.0;
  float viewODO = 0.0;
  vec3 sumR = vec3(0.0);
  vec3 sumM = vec3(0.0);
  float mu = dot(rayDir, sunDirection);
  float phaseR = rayleighPhase(mu);
  float phaseM = miePhase(mu);

  for (int i = 0; i < PRIMARY_STEPS; i++) {
    float t = rayStart + (float(i) + jitter * 0.33) * stepSize;
    float h = observerAltitude + t * rayDir.y;
    if (h < 0.0) break;
    if (h > atmosphereHeight) break;

    float groundFade = smoothstep(0.0, 2.0, h);
    float dR = rayleighDensity(h) * groundFade;
    float dM = mieEnabled ? mieDensity(h) * groundFade : 0.0;
    float dO = ozoneEnabled ? ozoneDensity(h) * groundFade : 0.0;
    viewODR += dR * stepSize;
    viewODM += dM * stepSize;
    viewODO += dO * stepSize;

    vec3 sunOD = lightMarch(h, sunDirection.y);
    vec3 viewOD = vec3(viewODR, viewODM, viewODO);
    vec3 transmittance = computeSampleTransmittance(sunOD, viewOD);
    float altitude01 = clamp(h / max(atmosphereHeight, 1e-4), 0.0, 1.0);
    float minSunElevationForLight = mix(0.0, -0.16, altitude01);
    float sunlightVisibility = smoothstep(
      minSunElevationForLight - 0.02,
      minSunElevationForLight + 0.02,
      sunElevation
    );

    sumR += dR * transmittance * sunlightVisibility * stepSize;
    if (mieEnabled) {
      sumM += dM * transmittance * sunlightVisibility * stepSize;
    }
  }

  vec3 scatteredLight = skySunIntensity * (
    phaseR * rayleighBeta * sumR +
    (mieEnabled ? phaseM * mieBeta * sumM : vec3(0.0))
  );

  vec3 viewTransmittance = exp(-(rayleighBeta * viewODR + mieBetaExt * viewODM + ozoneBetaAbs * viewODO));
  vec3 baseColor = inputColor.rgb;
  vec3 color = baseColor * viewTransmittance + scatteredLight;
  float sunAboveHorizon = smoothstep(-0.04, 0.04, sunDirection.y);
  if (isBackground) {
    float sunShape = softSunDisc(rayDir, sunDirection, sunDiscSize);
    vec3 sunTint = vec3(1.0, 0.97, 0.92);
    vec3 sunDiscLight = sunTint * directSunIntensity * 12.0 * sunShape * viewTransmittance * sunAboveHorizon;
    color += sunDiscLight;
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
import { EffectComposer } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Pass } from 'postprocessing';
import { Suspense, forwardRef, useMemo, useRef } from 'react';
import * as THREE from 'three';

import atmosphereShader from '!!raw-loader!./atmosphereShader.glsl';
import './scene.css';

const EARTH = {
  rayleighScaleHeight: 8.0,
  rayleighBeta: new THREE.Vector3(0.0058, 0.0135, 0.0331),
  mieScaleHeight: 1.2,
  mieBeta: 0.021,
  mieG: 0.758,
  ozoneBetaAbs: new THREE.Vector3(0.00065, 0.00188, 0.000085),
};

const OBSERVER_ALTITUDE = 10.0;
const ATMOSPHERE_HEIGHT = 80.0;

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

const createScatteringUniforms = () => ({
  tDiffuse: new THREE.Uniform(null),
  depthBuffer: new THREE.Uniform(null),
  cameraFar: new THREE.Uniform(5000),
  projectionMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
  viewMatrixInverse: new THREE.Uniform(new THREE.Matrix4()),
  uCameraPosition: new THREE.Uniform(new THREE.Vector3(0, 2, -8)),
  sunPosition: new THREE.Uniform(new THREE.Vector3(0.2, 0.6, 0.3).normalize()),
  blueNoiseTexture: new THREE.Uniform(null),
  uFrame: new THREE.Uniform(0),
  mieEnabled: new THREE.Uniform(true),
  ozoneEnabled: new THREE.Uniform(false),
  observerAltitude: new THREE.Uniform(OBSERVER_ALTITUDE),
  atmosphereHeight: new THREE.Uniform(ATMOSPHERE_HEIGHT),
  rayleighScaleHeight: new THREE.Uniform(EARTH.rayleighScaleHeight),
  rayleighBeta: new THREE.Uniform(EARTH.rayleighBeta.clone()),
  mieScaleHeight: new THREE.Uniform(EARTH.mieScaleHeight),
  mieBeta: new THREE.Uniform(EARTH.mieBeta),
  mieBetaExt: new THREE.Uniform(EARTH.mieBeta),
  mieG: new THREE.Uniform(EARTH.mieG),
  ozoneBetaAbs: new THREE.Uniform(EARTH.ozoneBetaAbs.clone()),
  sunIntensity: new THREE.Uniform(20.0),
  sunDiscSize: new THREE.Uniform(0.1),
});

class AtmospherePassImpl extends Pass {
  constructor() {
    super('AtmospherePass');
    this.name = 'AtmospherePass';
    this.needsSwap = true;
    this.needsDepthTexture = true;
    this.uniforms = createScatteringUniforms();
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
  const torusRef = useRef(null);
  const sunDirection = useMemo(() => new THREE.Vector3(), []);

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
    mieEnabled: { value: true, label: 'Mie Enabled' },
    ozoneEnabled: { value: true, label: 'Ozone Enabled' },
  });

  const { sunX, sunY, sunZ, sunIntensity } = useControls('Sun Position', {
    sunX: { value: 0.0, min: -1.0, max: 1.0, step: 0.001, label: 'Sun X' },
    sunY: { value: 0.4, min: -0.25, max: 1.0, step: 0.001, label: 'Sun Y' },
    sunZ: { value: 0.2, min: -1.0, max: 1.0, step: 0.001, label: 'Sun Z' },
    sunIntensity: { value: 12.0, min: 0.0, max: 40.0, step: 0.1, label: 'Sun Intensity' },
  });

  useFrame((state) => {
    const { camera } = state;
    sunDirection.set(sunX, sunY, sunZ);
    if (sunDirection.lengthSq() < 1e-5) {
      sunDirection.set(0.001, 0.001, 0.001);
    }
    sunDirection.normalize();

    const directLightFactor = THREE.MathUtils.smoothstep(sunDirection.y, -0.01, 0.03);
    camera.updateMatrixWorld();

    if (lightRef.current) {
      lightRef.current.position.copy(sunDirection).multiplyScalar(1000.0);
      lightRef.current.intensity = sunIntensity * 0.12 * directLightFactor;
    }

    const pass = atmospherePassRef.current;
    if (!pass) return;

    const { uniforms } = pass;
    uniforms.cameraFar.value = camera.far;
    uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
    uniforms.viewMatrixInverse.value = camera.matrixWorld;
    uniforms.uCameraPosition.value = camera.position;
    uniforms.sunPosition.value = sunDirection;
    uniforms.blueNoiseTexture.value = blueNoise;
    uniforms.mieEnabled.value = mieEnabled;
    uniforms.ozoneEnabled.value = ozoneEnabled;
    uniforms.sunIntensity.value = sunIntensity;

    if (Number.isNaN(uniforms.uFrame.value)) {
      uniforms.uFrame.value = 0;
    }
    uniforms.uFrame.value += 1;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, OBSERVER_ALTITUDE + 2, -20]} fov={45} near={0.1} far={5000} />
      <directionalLight ref={lightRef} castShadow intensity={2.0} />
      <mesh ref={torusRef} receiveShadow castShadow position={[0, OBSERVER_ALTITUDE, 0]}>
        <torusKnotGeometry args={[1, 0.35, 128, 100]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <EffectComposer enabled={effectsEnabled} multisampling={0}>
        <AtmospherePass ref={atmospherePassRef} />
      </EffectComposer>

      <OrbitControls
        ref={orbitRef}
        target={[0, OBSERVER_ALTITUDE, 0]}
        minDistance={3}
        maxDistance={300}
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
      dpr={[1, 1.25]}
    >
      <Suspense>
        <color attach="background" args={['#010101']} />
        <ambientLight intensity={0.02} />
        <AtmosphericScattering />
      </Suspense>
    </Canvas>
    <Leva collapsed />
  </>
);

export default Scene;
`;

const SkyDome = {
  '/App.js': {
    code: AppCode,
  },
  '/atmosphereShader.glsl': {
    code: AtmosphereShader,
    active: true,
  },
};

export default SkyDome;
