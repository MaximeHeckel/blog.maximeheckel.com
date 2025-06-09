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


const float STEP_SIZE = 0.4;
const int NUM_STEPS = 50;
const vec3 lightColor = vec3(0.4);
const float LIGHT_INTENSITY = 3.5;
const float FOG_INTENSITY = 0.02;

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

    if (density < 0.5) {
      t += STEP_SIZE;
      continue;
    }

    float distanceToLight = length(samplePos - lightPos);
    vec3 sampleLightDir = normalize(samplePos - lightPos);

    float attenuation = exp(-0.35 * distanceToLight);
    float scatterPhase = HGPhase(dot(rayDir, -sampleLightDir));

    vec3 luminance = lightColor * LIGHT_INTENSITY * attenuation * scatterPhase;

    float stepDensity = FOG_INTENSITY * density;
    stepDensity = max(stepDensity, 0.0);

    float stepTransmittance = BeersLaw(stepDensity * STEP_SIZE, 1.0);
    transmittance *= stepTransmittance;

    accumulatedLight += luminance * transmittance * stepDensity * STEP_SIZE;
      
    
    t += STEP_SIZE;
  }

  vec3 volumetricLight = accumulatedLight;
  vec3 finalColor = inputColor.rgb + volumetricLight;

  outputColor = vec4(finalColor, 1.0);
}
`;

const AppCode = `import { OrbitControls, 
  PerspectiveCamera,  
  useFBO, 
  useTexture,
  useGLTF,
  Backdrop,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect, Noise, Bloom } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Effect, EffectAttribute, BlendFunction, KernelSize, Resolution } from 'postprocessing';
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
    this.uniforms.get('blueNoiseTexture').value = this.blueNoiseTexture;
    this.uniforms.get('frame').value = this.frame;
    this.uniforms.get('enableBlueNoise').value = this.enableBlueNoise;
  }
}

const VolumetricLightingEffect = wrapEffect(VolumetricLightingEffectImpl);


const SHADOW_BIAS = 0.00001;

export const VolumetricLightEffect = () => {
  const effectRef = useRef();
  const lightRef = useRef();

  const { shadowMapSize, enabled } = useControls({
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

  blueNoiseTexture.wrapS = THREE.RepeatWrapping;
  blueNoiseTexture.wrapT = THREE.RepeatWrapping;

  blueNoiseTexture.minFilter = THREE.NearestMipmapLinearFilter;
  blueNoiseTexture.magFilter = THREE.NearestMipmapLinearFilter;

  const lightCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(90, 1.0, 0.1, 100);
    cam.fov = 90;
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

  const lightPosition = useMemo(() => new THREE.Vector3(0.0, 0.0, 0.0), []);
  

  useFrame((state) => {
    const { gl, camera, scene, clock } = state;

    if (lightRef.current) {
      lightRef.current.position.copy(lightPosition);
    }

    const lightDirection = new THREE.Vector3()
      .subVectors(camera.position, lightPosition)
      .normalize();

    lightCamera.position.copy(lightPosition);
    lightCamera.lookAt(camera.position);
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
      effectRef.current.lightDirection = lightDirection;
      effectRef.current.lightPosition = lightPosition;

      effectRef.current.shadowMap = shadowFBO.depthTexture;
      effectRef.current.lightViewMatrix = lightCamera.matrixWorldInverse;
      effectRef.current.lightProjectionMatrix = lightCamera.projectionMatrix;
      effectRef.current.blueNoiseTexture = blueNoiseTexture;

       if (Number.isNaN(effectRef.current.frame)) {
        effectRef.current.frame = 0;
      }
      effectRef.current.frame += 1;
    }

    camera.lookAt(0, 0.25, 0);
  });

  return (
    <>
      <mesh ref={lightRef}>
        <pointLight castShadow intensity={500.5} />
        <sphereGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color={new THREE.Color('white').multiplyScalar(10)}
        />
      </mesh>
      <EffectComposer enabled={enabled}>
        <VolumetricLightingEffect
          ref={effectRef}
          coneAngle={20} 
          shadowBias={SHADOW_BIAS}
          shadowMapSize={shadowMapSize}
          enableBlueNoise
        />
        <Bloom
          // @ts-ignore
          intensity={1.9}
          kernelSize={KernelSize.LARGE} // blur kernel size
          luminanceThreshold={0.5} // luminance threshold. Raise this value to mask out darker elements in the scene.
          luminanceSmoothing={0.8} // smoothness of the luminance threshold. Range is [0, 1]
          resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
          resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
        />
        <Noise opacity={0.015} blendFunction={BlendFunction.ADD} />
      </EffectComposer>
    </>
  );
};



const VolumetricLight = () => {
  const asteroidBeltRef = useRef();
  const asteroidBelt2Ref = useRef();
  const instancedMeshRef = useRef();
  const instancedMeshRef2 = useRef();

  const { scene: asteroidScene } = useGLTF('https://cdn.maximeheckel.com/models/asteroid/asteroid.gltf');

  const asteroidMesh = useMemo(
    () => asteroidScene.children[0],
    [asteroidScene],
  );

  const numAsteroids = 500;
  const ringInnerRadius = 7.5;
  const ringOuterRadius = 10.5;
  const ringHeight = 1.5;
  const minBoxSize = 0.01;
  const maxBoxSize = 0.135;
  const orbitSpeed = 1.3;

  const asteroidData = useMemo(() => {
    const data = [];
    // const euler = new THREE.Euler();
    // const quaternion = new THREE.Quaternion();
    const scaleVec = new THREE.Vector3();

    for (let i = 0; i < numAsteroids; i++) {
      const initialAngle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.randFloat(
        ringInnerRadius,
        ringOuterRadius,
      );
      const yOffset = THREE.MathUtils.randFloat(
        -ringHeight / 2,
        ringHeight / 2,
      );

      const initialEuler = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      );

      const scale = THREE.MathUtils.randFloat(minBoxSize, maxBoxSize);
      scaleVec.set(scale, scale, scale);

      const rotationSpeed = THREE.MathUtils.randFloat(0.2, 1.0);

      data.push({
        initialAngle,
        radius,
        yOffset,
        rotationSpeed,
        initialEuler: initialEuler.clone(),
        scale: scaleVec.clone(),
      });
    }
    return data;
  }, []);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const positionVec = useMemo(() => new THREE.Vector3(), []);
  const tempEuler = useMemo(() => new THREE.Euler(), []);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);

  const asteroidRotationSpeed = 0.25;

  useFrame((state) => {
    const { clock } = state;
    const elapsedTime = clock.getElapsedTime();


    if (instancedMeshRef.current && instancedMeshRef2.current) {
      for (let i = 0; i < numAsteroids; i++) {
        const data = asteroidData[i];

        const currentAngle =
          data.initialAngle + (elapsedTime * orbitSpeed) / (data.radius * 5.5);

        const x = Math.cos(currentAngle) * data.radius;
        const z = Math.sin(currentAngle) * data.radius;
        positionVec.set(x, data.yOffset, z);

        tempEuler.set(
          data.initialEuler.x +
            elapsedTime * data.rotationSpeed * asteroidRotationSpeed,
          data.initialEuler.y +
            elapsedTime * data.rotationSpeed * asteroidRotationSpeed,
          data.initialEuler.z +
            elapsedTime * data.rotationSpeed * asteroidRotationSpeed,
        );

        tempQuaternion.setFromEuler(tempEuler);

        tempMatrix.compose(positionVec, tempQuaternion, data.scale);

        instancedMeshRef.current.setMatrixAt(i, tempMatrix);
        instancedMeshRef2.current.setMatrixAt(i, tempMatrix);
      }

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      instancedMeshRef2.current.instanceMatrix.needsUpdate = true;
    }
  });

  const blackMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 'black' }),
    [],
  );

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, -20]}
        fov={45}
        near={0.1}
        far={200}
      />
      <group ref={asteroidBeltRef} rotation={[0, 0, -Math.PI / 12]}>
        <instancedMesh
          ref={instancedMeshRef}
          args={[asteroidMesh.geometry, blackMaterial, numAsteroids]}
          castShadow
          receiveShadow
        />
      </group>
      <group
        ref={asteroidBelt2Ref}
        position={[0, 0, 0]}
        rotation={[0, Math.PI, Math.PI / 3]}
      >
        <instancedMesh
          ref={instancedMeshRef2}
          args={[asteroidMesh.geometry, blackMaterial, numAsteroids]}
          castShadow
        />
      </group>
      <VolumetricLightEffect  />
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
          <ambientLight intensity={20.15} />
           <OrbitControls />
          <VolumetricLight />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Solar = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Solar;
