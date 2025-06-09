const FragmentShader = `uniform mat4 projectionMatrixInverse;
uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform mat4 viewMatrixInverse;
uniform vec3 cameraPosition;
uniform float cameraFar;

uniform int uFrame;
uniform sampler2D blueNoiseTexture;

uniform sampler2D shadowMap;
uniform samplerCube shadowMapCube;
uniform float shadowNear;
uniform float shadowFar;
uniform float shadowBias;

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

// Function to unpack depth/distance
// This might need adjustment based on how you *store* depth in the shadow map render pass.
float unpackDistance(vec4 packedValue) {
    return packedValue.r; 
}

float calculateShadow(vec3 worldPosition) {
  vec3 lightToFrag = worldPosition - lightPosition;
  float currentDistance = length(lightToFrag);

  if (currentDistance < 0.001) {
      return 1.0;
  }

  vec4 sampledEncodedVec = textureCube(shadowMapCube, lightToFrag);

  float sampledDistanceNormalized = unpackDistance(sampledEncodedVec);

  if (sampledDistanceNormalized < 0.1) {
      return 1.0;
  }

  float sampledDistance = sampledDistanceNormalized * shadowFar;

  if (currentDistance > sampledDistance + shadowBias) {
      return 0.0;
  } else {
      return 1.0;
  }
}

float sdSphere(vec3 p, vec3 center, float radius) {
    return length(p - center) - radius;
}


const float SCATTERING_ANISO = 0.3;

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

const float STEP_SIZE = 0.5;
const int NUM_STEPS = 120;
const vec3 lightColor = vec3(1.0);
const float LIGHT_INTENSITY = 2.0;
const float FOG_DENSITY = 0.005;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float depth = readDepth(depthBuffer, uv);
  vec3 worldPosition = getWorldPosition(uv, depth);

  vec3 rayOrigin = cameraPosition;
  vec3 rayDir = normalize(worldPosition - rayOrigin);

  float sceneDepth = length(worldPosition - cameraPosition);

  vec3 lightPos = lightPosition;
  vec3 lightDir = normalize(lightDirection);

  float smoothEdgeWidth = 0.1;
  float blueNoise = texture2D(blueNoiseTexture, gl_FragCoord.xy / 1024.0).r;
  float offset = fract(blueNoise + float(uFrame%32) / sqrt(0.5));
  
   float t = offset * STEP_SIZE; 

  float transmittance = 3.0;
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


    float sdfVal = sdSphere(samplePos, lightPos, 150.0);
    float shapeFactor = smoothstep(0.0, -smoothEdgeWidth, sdfVal);

    if (shapeFactor < 0.1) {
      t += STEP_SIZE;
      continue;
    }

    float distanceToLight = length(samplePos - lightPos);
    vec3 sampleLightDir = normalize(samplePos - lightPos);

    float attenuation = exp(-0.1 * distanceToLight);
    float scatterPhase = HGPhase(dot(rayDir, -sampleLightDir));
    vec3 luminance = lightColor * LIGHT_INTENSITY * attenuation * scatterPhase;

    float stepDensity = FOG_DENSITY * shapeFactor;
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
    shadowBias = 0.0001,
    shadowMapCube = null,
    shadowNear = 0.1,
    shadowFar = 100.0,
    uFrame = 0,
    blueNoiseTexture = null,
  ) {
    const uniforms = new Map([
      ['cameraFar', new THREE.Uniform(cameraFar)],
      ['projectionMatrixInverse', new THREE.Uniform(projectionMatrixInverse)],
      ['viewMatrixInverse', new THREE.Uniform(viewMatrixInverse)],
      ['cameraPosition', new THREE.Uniform(cameraPosition)],
      ['lightDirection', new THREE.Uniform(lightDirection)],
      ['lightPosition', new THREE.Uniform(lightPosition)],
      ['shadowMapCube', new THREE.Uniform(shadowMapCube)],
      ['shadowNear', new THREE.Uniform(shadowNear)],
      ['shadowFar', new THREE.Uniform(shadowFar)],
      ['shadowBias', new THREE.Uniform(shadowBias)],
      ['uFrame', new THREE.Uniform(uFrame)],
      ['blueNoiseTexture', new THREE.Uniform(blueNoiseTexture)],
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
    this.uniforms.get('shadowMapCube').value = this.shadowMapCube;
    this.uniforms.get('shadowNear').value = this.shadowNear;
    this.uniforms.get('shadowFar').value = this.shadowFar;
    this.uniforms.get('shadowBias').value = this.shadowBias;
    this.uniforms.get('uFrame').value = this.uFrame;
    this.uniforms.get('blueNoiseTexture').value = this.blueNoiseTexture;
  }
}

const VolumetricLightingEffect = wrapEffect(VolumetricLightingEffectImpl);

const SHADOW_MAP_SIZE = 256;
const SHADOW_BIAS = 0.1;
const CUBE_CAMERA_NEAR = 0.01;
const CUBE_CAMERA_FAR = 100.0; // Adjusted for better depth resolution


export const VolumetricLightEffect = () => {
  const effectRef = useRef();
  const lightRef = useRef();

  const blueNoiseTexture = useTexture(
    'https://cdn.maximeheckel.com/noises/blue-noise.png',
  );

  blueNoiseTexture.wrapS = THREE.RepeatWrapping;
  blueNoiseTexture.wrapT = THREE.RepeatWrapping;

  blueNoiseTexture.minFilter = THREE.NearestMipmapLinearFilter;
  blueNoiseTexture.magFilter = THREE.NearestMipmapLinearFilter;

  const shadowCubeRenderTarget = useMemo(() => {
    const rt = new THREE.WebGLCubeRenderTarget(SHADOW_MAP_SIZE, {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
    });
    return rt;
  }, []);

  const shadowCubeCamera = useMemo(() => {
    const cam = new THREE.CubeCamera(CUBE_CAMERA_NEAR, CUBE_CAMERA_FAR, shadowCubeRenderTarget);
    return cam;
  }, [shadowCubeRenderTarget]);


  const shadowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: \`
             varying vec3 vWorldPosition;
             void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
             }
          \`,
        fragmentShader: \`
             uniform vec3 lightPosition;
             uniform float shadowFar;
             varying vec3 vWorldPosition;
            
             void main() {
                // Calculate linear distance from the light source
                float distance = length(vWorldPosition);
                // Normalize distance to [0, 1] using the shadow camera's far plane
                float normalizedDistance = clamp(distance / shadowFar, 0.0, 1.0);
                // Store the normalized distance in the red channel.
                gl_FragColor = vec4(normalizedDistance, 0.0, 0.0, 1.0);
             }
          \`,
        side: THREE.DoubleSide,
        uniforms: {
          lightPosition: { value: new THREE.Vector3() },
          shadowFar: { value: CUBE_CAMERA_FAR },
        },
      }),
    [],
  );

  const lightPosition = useRef(new THREE.Vector3(0.0, 0.0, 0.0)); 
  const lightDirection = useRef(new THREE.Vector3().copy(lightPosition.current).negate().normalize());

  useFrame((state) => {
    const { gl, camera, scene, clock } = state;

    if (lightRef.current) {
      lightRef.current.position.copy(lightPosition.current);
    }

    shadowCubeCamera.position.copy(lightPosition.current);

    const currentRenderTarget = gl.getRenderTarget();
    const currentShadows = gl.shadowMap.enabled;

    const originalOverrideMaterial = scene.overrideMaterial;
    gl.shadowMap.enabled = false;

    shadowMaterial.uniforms.lightPosition.value = new THREE.Vector3(0.0, 0.0, 1.0);
    shadowMaterial.uniforms.shadowFar.value = CUBE_CAMERA_FAR;

    if (lightRef.current) lightRef.current.visible = false;

    scene.overrideMaterial = shadowMaterial;
    shadowCubeCamera.update(gl, scene); // Warning: This renders the scene 6 times (for each face of the cube)!

    scene.overrideMaterial = originalOverrideMaterial;

    if (lightRef.current) lightRef.current.visible = true;

    gl.setRenderTarget(currentRenderTarget);
    gl.shadowMap.enabled = currentShadows;

   
    if (effectRef.current) {
      effectRef.current.cameraFar = camera.far;
      effectRef.current.projectionMatrixInverse =
        camera.projectionMatrixInverse;
       effectRef.current.viewMatrixInverse = camera.matrixWorld;

      effectRef.current.cameraPosition = camera.position;
      effectRef.current.lightDirection = lightDirection.current;
      effectRef.current.lightPosition = lightPosition.current;

      effectRef.current.shadowMapCube = shadowCubeRenderTarget.texture;
      effectRef.current.shadowNear = shadowCubeCamera.children[0]?.near;
      effectRef.current.shadowFar = shadowCubeCamera.children[0]?.far;

      effectRef.current.shadowBias = SHADOW_BIAS;
      effectRef.current.blueNoiseTexture = blueNoiseTexture;
      effectRef.current.uFrame += 1;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <pointLight ref={lightRef} position={lightPosition.current} intensity={5.0} />
      <EffectComposer>
        <VolumetricLightingEffect ref={effectRef} />
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
        position={[0, 0, -50]}
        fov={70}
        near={0.1}
        far={200}
      />
      <mesh castShadow receiveShadow position={[-17, 0, 0]}>
        <sphereGeometry args={[5, 32]} />
        <meshStandardMaterial color='#ff0000' />
      </mesh>
      <mesh castShadow receiveShadow position={[17, 0, 0]}>
        <sphereGeometry args={[5, 32]} />
        <meshStandardMaterial color='#0000ff' />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 17, 0]}>
        <sphereGeometry args={[5, 32]} />
        <meshStandardMaterial color='#00ff00' />
      </mesh>
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

const CubeCam = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default CubeCam;
