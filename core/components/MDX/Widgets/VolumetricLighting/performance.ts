const FragmentShader = `uniform mat4 projectionMatrixInverse;
uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform mat4 viewMatrixInverse;
uniform vec3 cameraPosition;
uniform float cameraFar;
uniform float coneAngle;

uniform sampler2D shadowMap;
uniform mat4 lightViewMatrix;
uniform mat4 lightProjectionMatrix;
uniform float shadowBias;
uniform sampler2D noiseTexture;
uniform sampler2D blueNoiseTexture;
uniform int frame;
uniform bool enableBlueNoise;
float readDepth(sampler2D depthSampler, vec2 coord) {
  return texture2D(depthSampler, coord).x;
}

vec3 getWorldPosition(vec2 uv, float depth) {
  float clipZ = depth * 2.0 - 1.0;
  vec2 ndc = uv * 2.0 - 1.0;
  vec4 clip = vec4(ndc, clipZ, 1.0);
  vec4 view = projectionMatrixInverse * clip;
  vec4 world = viewMatrixInverse * view;

  return world.xyz / world.w;
}

float calculateShadow(vec3 worldPosition) {
  vec4 lightClipPos = lightProjectionMatrix * lightViewMatrix * vec4(worldPosition, 1.0);
  vec3 lightNDC = lightClipPos.xyz / lightClipPos.w;

  vec2 shadowCoord = lightNDC.xy * 0.5 + 0.5;
  float lightDepth = lightNDC.z * 0.5 + 0.5;

  if (shadowCoord.x < 0.0 || shadowCoord.x > 1.0 || shadowCoord.y < 0.0 || shadowCoord.y > 1.0 || lightDepth > 1.0) {
    return 1.0; 
  }

  float shadowMapDepth = texture2D(shadowMap, shadowCoord).x;
  
  if (lightDepth > shadowMapDepth + shadowBias) {
    return 0.0;
  }

  return 1.0;
}

float sdCone(vec3 p, vec3 axisOrigin, vec3 axisDir, float angleRad) {
  vec3 p_to_origin = p - axisOrigin;

  float h = dot(p_to_origin, axisDir); // Height along axis
  float r = length(p_to_origin - axisDir * h); // Radius at height h

  float c = cos(angleRad);
  float s = sin(angleRad);

  vec2 q = vec2(r, h);

  // Calculates distance based on height/radius and cone angle
  float distToSurfaceLine = r * c - h * s;
  float distToApexPlane = -h;

  if (h < 0.0 && distToSurfaceLine > 0.0) {
      return length(p_to_origin); 
  }
  
  vec2 boundaryDists = vec2(distToSurfaceLine, distToApexPlane);
  return length(max(boundaryDists, 0.0)) + min(max(boundaryDists.x, boundaryDists.y), 0.0);
}

const float SCATTERING_ANISO = 0.5;

float HGPhase(float mu) {
  float g = SCATTERING_ANISO;
  float gg = g * g;
  
  float denom = 1.0 + gg - 2.0 * g * mu;
  denom = max(denom, 0.0001); 

  
  float scatter = (1.0 - gg) / pow(denom, 1.5);
  return scatter;
}

float BeersLaw (float dist, float absorption) {
  return exp(-dist * absorption);
}

float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);

  vec2 uv = (p.xy+vec2(37.0,239.0)*p.z) + f.xy;
  vec2 tex = textureLod(noiseTexture,(uv+0.5)/256.0,0.0).yx;

  return mix( tex.x, tex.y, f.z ) * 2.0 - 1.0;
}

const float NOISE_FREQUENCY = 0.5;
const float NOISE_AMPLITUDE = 10.0;
const int NOISE_OCTAVES = 3;

float fbm(vec3 p) {
  vec3 q = p + time * 0.5 * vec3(1.0, -0.2, -1.0);
  float g = noise(q);

  float f = 0.0;
  float scale = NOISE_FREQUENCY;
  float factor = NOISE_AMPLITUDE;

  for (int i = 0; i < NOISE_OCTAVES; i++) {
      f += scale * noise(q);
      q *= factor;
      factor += 0.21;
      scale *= 0.5;
  }

  return f;
}

const float STEP_SIZE = 0.5;
const int NUM_STEPS = 50;
const vec3 lightColor = vec3(0.2);
const float LIGHT_INTENSITY = 3.5;
const float FOG_INTENSITY = 0.1;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float depth = readDepth(depthBuffer, uv);
  vec3 worldPosition = getWorldPosition(uv, depth);

  vec3 rayOrigin = cameraPosition;
  vec3 rayDir = normalize(worldPosition - rayOrigin);

  float sceneDepth = length(worldPosition - cameraPosition);

  vec3 lightPos = lightPosition;
  vec3 lightDir = normalize(lightDirection);

  float coneAngleRad = radians(coneAngle);
  float halfConeAngleRad = coneAngleRad * 0.5;

  float blueNoise = texture2D(blueNoiseTexture, gl_FragCoord.xy / 1024.0).r;
  float offset = fract(blueNoise + float(frame%32) / sqrt(0.5));
  float t = STEP_SIZE; 

  if (enableBlueNoise) {
    t *= offset; 
  }

  float transmittance = 5.0;
  vec3 accumulatedLight = vec3(0.0);
  

  for (int i = 0; i < NUM_STEPS; i++) {
    vec3 samplePos = rayOrigin + rayDir * t;

    if (t > sceneDepth || t > cameraFar) {
      break;
    }

    float shadowFactor = calculateShadow(samplePos);
    if (shadowFactor == 0.0) {
        t += STEP_SIZE;
        continue;
    }


    float sdfVal = sdCone(samplePos, lightPos, lightDir, halfConeAngleRad);
    float density = -sdfVal;

    if (density < 0.1) {
      t += STEP_SIZE;
      continue;
    }

    float distanceToLight = length(samplePos - lightPos);
    vec3 sampleLightDir = normalize(samplePos - lightPos);

    float attenuation = exp(-0.3 * distanceToLight);
    float scatterPhase = HGPhase(dot(rayDir, -sampleLightDir));
    vec3 luminance = lightColor * LIGHT_INTENSITY * attenuation * scatterPhase;

    float stepDensity = FOG_INTENSITY * density;
    stepDensity = max(stepDensity, 0.0);

    float stepTransmittance = BeersLaw(stepDensity * STEP_SIZE, 1.0);
    accumulatedLight += luminance * transmittance * stepDensity * STEP_SIZE;

    transmittance *= stepTransmittance;
    
    t += STEP_SIZE;
  }

  vec3 volumetricLight = accumulatedLight;
  vec3 finalColor = inputColor.rgb + volumetricLight;

  outputColor = vec4(finalColor, 1.0);
}
`;

const AppCode = `import { OrbitControls, PerspectiveCamera, Environment, useFBO, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect, Noise } from '@react-three/postprocessing';
import { Leva,useControls } from 'leva';
import { Effect, EffectAttribute, BlendFunction } from 'postprocessing';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import './scene.css';

class VolumetricLightingEffectImpl extends Effect {
  constructor(
    cameraFar = 500,
    projectionMatrixInverse = new THREE.Matrix4(),
    viewMatrixInverse = new THREE.Matrix4(),
    cameraPosition = new THREE.Vector3(),
    lightDirection = new THREE.Vector3(),
    lightPosition = new THREE.Vector3(),
    coneAngle = 45.0,
    shadowMap = null,
    shadowBias = 0.0001,
    lightViewMatrix = new THREE.Matrix4(),
    lightProjectionMatrix = new THREE.Matrix4(),
    noiseTexture = null,
    blueNoiseTexture = null,
    frame = 0,
    enableBlueNoise = true,
  ) {
    const uniforms = new Map([
      ['cameraFar', new THREE.Uniform(cameraFar)],
      ['projectionMatrixInverse', new THREE.Uniform(projectionMatrixInverse)],
      ['viewMatrixInverse', new THREE.Uniform(viewMatrixInverse)],
      ['cameraPosition', new THREE.Uniform(cameraPosition)],
      ['lightDirection', new THREE.Uniform(lightDirection)],
      ['lightPosition', new THREE.Uniform(lightPosition)],
      ['coneAngle', new THREE.Uniform(coneAngle)],
      ['shadowMap', new THREE.Uniform(shadowMap)],
      ['shadowBias', new THREE.Uniform(shadowBias)],
      ['lightViewMatrix', new THREE.Uniform(lightViewMatrix)],
      ['lightProjectionMatrix', new THREE.Uniform(lightProjectionMatrix)],
      ['noiseTexture', new THREE.Uniform(noiseTexture)],
      ['blueNoiseTexture', new THREE.Uniform(blueNoiseTexture)],
      ['frame', new THREE.Uniform(frame)],
      ['enableBlueNoise', new THREE.Uniform(enableBlueNoise)],
    ]);

    super('MyCustomEffect', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('projectionMatrixInverse').value = this.projectionMatrixInverse;
    this.uniforms.get('viewMatrixInverse').value = this.viewMatrixInverse;
    this.uniforms.get('cameraPosition').value = this.cameraPosition;
    this.uniforms.get('cameraFar').value = this.cameraFar;
    this.uniforms.get('lightDirection').value = this.lightDirection;
    this.uniforms.get('lightPosition').value = this.lightPosition;
    this.uniforms.get('coneAngle').value = this.coneAngle;
    this.uniforms.get('shadowMap').value = this.shadowMap;
    this.uniforms.get('shadowBias').value = this.shadowBias;
    this.uniforms.get('lightViewMatrix').value = this.lightViewMatrix;
    this.uniforms.get('lightProjectionMatrix').value = this.lightProjectionMatrix;
    this.uniforms.get('noiseTexture').value = this.noiseTexture;
    this.uniforms.get('blueNoiseTexture').value = this.blueNoiseTexture;
    this.uniforms.get('frame').value = this.frame;
    this.uniforms.get('enableBlueNoise').value = this.enableBlueNoise;
  }
}

const VolumetricLightingEffect = wrapEffect(VolumetricLightingEffectImpl);


const SHADOW_BIAS = 0.0001;

export const VolumetricLightEffect = () => {
  const effectRef = useRef();
  const lightRef = useRef();
  const {enableBlueNoise, shadowMapSize, enabled } = useControls({
    enableBlueNoise: {
      value: true,
      label: 'Enable Blue Noise',
    },
    shadowMapSize: {
      value: 256,
      options: [128, 256, 512, 1024],
      label: 'Shadow Map Size',
    },
    enabled: {
      value: true,
      label: 'Enable Effect',
    },
  });

  const blueNoiseTexture = useTexture(
    'https://cdn.maximeheckel.com/noises/blue-noise.png',
  );

  const noiseTexture = useTexture(
    'https://cdn.maximeheckel.com/noises/noise2.png',
  );

  noiseTexture.wrapS = THREE.RepeatWrapping;
  noiseTexture.wrapT = THREE.RepeatWrapping;

  noiseTexture.minFilter = THREE.NearestMipmapLinearFilter;
  noiseTexture.magFilter = THREE.NearestMipmapLinearFilter;

  blueNoiseTexture.wrapS = THREE.RepeatWrapping;
  blueNoiseTexture.wrapT = THREE.RepeatWrapping;

  blueNoiseTexture.minFilter = THREE.NearestMipmapLinearFilter;
  blueNoiseTexture.magFilter = THREE.NearestMipmapLinearFilter;

  const lightCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(90, 1.0, 0.1, 100);
    cam.fov = 45;
    return cam;
  }, []);

  const shadowFBO = useFBO(shadowMapSize, shadowMapSize, {
    depth: true,
    depthTexture: new THREE.DepthTexture(
      shadowMapSize,
      shadowMapSize,
      THREE.FloatType,
    ),
  });

  const lightPosition = useRef(new THREE.Vector3(4.0, 4.0, -4.0)); 
  const lightDirection = useRef(new THREE.Vector3().copy(lightPosition.current).negate().normalize());

  useFrame((state) => {
    const { gl, camera, scene, clock } = state;

    const angle = clock.getElapsedTime() * 1.25;
    if (lightRef.current) {
      lightRef.current.position.copy(lightPosition.current);
    }

    const currentLightTargetPos = new THREE.Vector3().addVectors(lightPosition.current, lightDirection.current);

    lightCamera.position.copy(lightPosition.current);
    lightCamera.lookAt(currentLightTargetPos);
    lightCamera.updateMatrixWorld();
    lightCamera.updateProjectionMatrix();

    const currentRenderTarget = gl.getRenderTarget();

    gl.setRenderTarget(shadowFBO);
    gl.clear(false, true, false);
    gl.render(scene, lightCamera);

    gl.setRenderTarget(currentRenderTarget);
    gl.render(scene, camera);

    if (effectRef.current) {
      effectRef.current.cameraFar = camera.far;
      effectRef.current.projectionMatrixInverse =
        camera.projectionMatrixInverse;
       effectRef.current.viewMatrixInverse = camera.matrixWorld;

      effectRef.current.cameraPosition = camera.position;
      effectRef.current.lightDirection = lightDirection.current;
      effectRef.current.lightPosition = lightPosition.current;

      effectRef.current.shadowMap = shadowFBO.depthTexture;
      effectRef.current.lightViewMatrix = lightCamera.matrixWorldInverse;
      effectRef.current.lightProjectionMatrix = lightCamera.projectionMatrix;
      effectRef.current.noiseTexture = noiseTexture;
      effectRef.current.blueNoiseTexture = blueNoiseTexture;
      effectRef.current.enableBlueNoise = enableBlueNoise;
       if (Number.isNaN(effectRef.current.frame)) {
        effectRef.current.frame = 0;
      }
      effectRef.current.frame += 1;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <directionalLight ref={lightRef} position={lightPosition.current} intensity={3.0} />
      <EffectComposer enabled={enabled}>
        <VolumetricLightingEffect
          ref={effectRef}
          coneAngle={45} 
          shadowBias={SHADOW_BIAS}
          shadowMapSize={shadowMapSize}
          enableBlueNoise={enableBlueNoise}
        />
        <Noise opacity={0.01} blendFunction={BlendFunction.ADD} />
      </EffectComposer>
    </>
  );
};



const VolumetricLight = () => {
  

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, -6]}
        fov={70}
        near={0.1}
        far={200}
      />
      <mesh>
        <sphereGeometry args={[1, 256]} />
        <meshStandardMaterial color='lightgray' />
      </mesh>
      <Environment 
        background 
        backgroundIntensity={0.04}
        backgroundBlurriness={0.05}
        environmentIntensity={0.1}
        path="https://cdn.maximeheckel.com/cubemaps/gallery/" 
        files={["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]}
      />
      <VolumetricLightEffect />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        gl={{
          alpha: true,
        }}
        dpr={[1, 1.5]}
      >
        <Suspense>
          <color attach='background' args={['#000000']} />
          <ambientLight intensity={0.15} />
          <OrbitControls />
          <VolumetricLight />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Performance = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Performance;
