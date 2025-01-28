const FragmentShader = `uniform float distortion;
uniform vec3 lightPosition;
uniform float fill;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

const float SPREAD = 0.035;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float fluteCount = 25.0;
  float flutePosition = fract(uv.x * fluteCount + 0.5);

  vec3 normal = vec3(0.0);
  normal.x = cos(flutePosition * PI * 2.0) * PI * 0.15;
  normal.y = 0.0;
  normal.z = sqrt(1.0 - normal.x * normal.x);
  normal = normalize(normal);

  vec3 lightDir = normalize(vec3(lightPosition));
  float diffuse = max(dot(normal, lightDir), 0.0);
  float specular = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
  
  vec2 distortedUV = uv + normal.xy * distortion;

  if(uv.x < fill) {
    const float sigma = 20.0;
    float noiseScale = 1.0; // Adjust for frost grain size
    float frostAmount = 0.002; // Adjust for frost intensity
    vec2 noiseUV = distortedUV * noiseScale;
    float noise = random(noiseUV) * 2.0 - 1.0;

    float blurSize = 0.004;
    float totalWeight = 0.0;
    vec4 color = vec4(0.0);
    color = texture(inputBuffer, distortedUV);

    float colorR = 0.0;
    float colorG = 0.0;
    float colorB = 0.0;

    for(float i = -2.0; i <= 2.0; i++) {
      for(float j = -2.0; j <= 2.0; j++) {
        vec2 offset = vec2(i, j) * blurSize;
        float weight = exp(-(i * i + j * j) / (2.0 * sigma * sigma));
        vec2 sampleUV = distortedUV + noise * frostAmount + offset;
        
        colorR += texture2D(inputBuffer, sampleUV + vec2(distortion, 0.0) * 0.02).r * weight;
        colorG += texture2D(inputBuffer, sampleUV).g * weight;
        colorB += texture2D(inputBuffer, sampleUV - vec2(distortion, 0.0) * 0.02).b * weight;
        totalWeight += weight;
      }
    }

    color /= totalWeight;
    color.r = colorR / totalWeight;
    color.g = colorG / totalWeight;
    color.b = colorB / totalWeight;
    color.a = 1.0;
    

    float ambient = 0.5;
    color.rgb *= (ambient + diffuse * 0.5);
    color.rgb += specular * 0.05;
    outputColor = color;
  } else {
      outputColor = inputColor;
  }
}
`;

const Model = `import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";


const TP7 = () => {
  const { scene } = useGLTF('https://cdn.maximeheckel.com/models/te-tp-7/scene.gltf');

  useEffect(() => {
    scene.scale.setScalar(25);
  }, [scene]);

  return <primitive object={scene} />;
};

export { TP7 };
`;

const AppCode = `import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import { TP7 } from './Model';
import './scene.css';

class CustomFluttedGlassEffectImpl extends Effect {
  constructor({ pixelSize = 1.0 }) {
    const uniforms = new Map([
      ['distortion', { value: 0.95 }],
      ['lightPosition', { value: [1.0, 0, 1.0] }],
      ['fill', { value: 0.5 }],
    ]);

    super('CustomFluttedGlassEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('distortion').value = this.distortion / 10.0;
    this.uniforms.get('lightPosition').value = this.lightPosition;
    this.uniforms.get('fill').value = this.fill;
  }
}

const CustomFluttedGlassEffect = wrapEffect(CustomFluttedGlassEffectImpl);

export const FluttedGlassEffect = () => {
  const effectRef = useRef();

  const { distortion, lightPosition, fill } = useControls({
    distortion: {
      value: 0.95,
      min: 0.0,
      max: 1.5,
      step: 0.01,
    },
    lightPosition: {
      value: [1.0, 0, 1.0],
    },
    fill: {
      value: 0.5,
      min: 0.0,
      max: 1.0,
      step: 0.01,
    },
  });

  useFrame((state) => {
    const { camera } = state;

    if (effectRef.current) {
      effectRef.current.distortion = distortion;
      effectRef.current.lightPosition = lightPosition;
      effectRef.current.fill = fill;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <EffectComposer>
      <CustomFluttedGlassEffect
        ref={effectRef}
        distortion={distortion}
        lightPosition={lightPosition}
        fill={fill}
      />
    </EffectComposer>
  );
};

const FluttedGlass = () => {
  const meshRef = useRef();

  useFrame((state) => {
    const { clock } = state;
  
    meshRef.current.rotation.y =
      Math.PI * 0.85 + Math.sin(clock.getElapsedTime() * 0.45) * 0.15;
    meshRef.current.position.y =
      Math.sin(state.clock.getElapsedTime() * 0.7) * 0.15;
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, -5]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <group
        ref={meshRef}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 3, Math.PI * 0.85, 0.0]}
      >
        <TP7 />
      </group>
      <FluttedGlassEffect />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.5]}
      >
        <Suspense>
          <color attach='background' args={['#efefef']} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[-5, 7, -5]} intensity={5.0} />
          <OrbitControls />
          <FluttedGlass />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const FluttedGlass = {
  '/App.js': {
    code: AppCode,
  },
  '/Model.js': {
    code: Model,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default FluttedGlass;
