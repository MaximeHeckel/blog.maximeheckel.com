const FragmentShader = `uniform float pixelSize;
uniform int pattern;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  float rowIndex = floor(uv.x / normalizedPixelSize.x);
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
  vec4 color = texture2D(inputBuffer, uvPixel);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
  
  vec2 cellUV = fract(uv / normalizedPixelSize);
  color = vec4(1.0);

  if(pattern == 0) {
    const float stripesMatrix[64] = float[64](
      0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2,
      0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0,
      1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0,
      1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2,
      0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2,
      0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0,
      1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0,
      1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2
    );

    const float crossStripeMatrix[64] = float[64](
      1.0, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 1.0,
      0.2, 1.0, 0.2, 0.2, 0.2, 0.2, 1.0, 0.2,
      0.2, 0.2, 1.0, 0.2, 0.2, 1.0, 0.2, 0.2,
      0.2, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 0.2,
      0.2, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 0.2,
      0.2, 0.2, 1.0, 0.2, 0.2, 1.0, 0.2, 0.2,
      0.2, 1.0, 0.2, 0.2, 0.2, 0.2, 1.0, 0.2,
      1.0, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 1.0
    );

    int x = int(cellUV.x * 8.0);
    int y = int(cellUV.y * 8.0);
    int index = y * 8 + x;
    
    if(luma < 0.6) {
        color = (stripesMatrix[index] > luma) ? vec4(1.0) : vec4(0.0, 0.31, 0.933, 1.0);
    } else {
        color = (crossStripeMatrix[index] > luma) ? vec4(1.0) : vec4(0.0, 0.31, 0.933, 1.0);
    }
  }

  if(pattern == 1) {
    const float sineMatrix[64] = float[64](
        0.99, 0.75,  0.2,  0.2,  0.2,  0.2, 0.99, 0.99,
        0.99, 0.99, 0.75,  0.2,  0.2, 0.99, 0.99, 0.75,
        0.2, 0.99, 0.99, 0.75, 0.99, 0.99,  0.2,  0.2,
        0.2,  0.2, 0.99, 0.99, 0.99,  0.2,  0.2,  0.2,
        0.2,  0.2,  0.2, 0.99, 0.99, 0.99,  0.2,  0.2,
        0.2,  0.2, 0.99, 0.99, 0.75, 0.99, 0.99,  0.2,
        0.75, 0.99, 0.99,  0.2,  0.2, 0.75, 0.99, 0.99,
        0.99, 0.99,  0.2,  0.2,  0.2,  0.2, 0.75, 0.99
    );

    int x = int(cellUV.x * 8.0);
    int y = int(cellUV.y * 8.0);
    int index = y * 8 + x;
    color = (sineMatrix[index] > luma) ? vec4(1.0) : vec4(0.0, 0.31, 0.933, 1.0);
  }

  outputColor = color;
}
`;

const Model = `import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";


const Venus = () => {
  const meshRef = useRef();

  const { nodes } = useGLTF("https://cdn.maximeheckel.com/models/venus/scene.gltf");

  useEffect(() => {
    meshRef.current.rotation.y = -Math.PI;
    meshRef.current.rotation.z = -Math.PI / 3;
    meshRef.current.rotation.x = Math.PI / 2;
    meshRef.current.position.set(0, -2, 0);
    meshRef.current.scale.setScalar(0.002);
  }, []);

  return (
    <mesh ref={meshRef} geometry={nodes.Object_2.geometry}>
      <meshStandardMaterial color='#0097F7' />
    </mesh>
  );
};

export { Venus };
`;

const AppCode = `import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import { Venus } from './Model';
import './scene.css';

class CustomPatternsEffectImpl extends Effect {
  constructor({ pixelSize = 1.0, pattern = 0 }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
      ['pattern', new THREE.Uniform(pattern)],
    ]);

    super('CustomPatternsEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
    this.uniforms.get('pattern').value = this.pattern;
  }
}

const CustomPatternsEffect = wrapEffect(CustomPatternsEffectImpl);

export const PatternsEffect = () => {
  const effectRef = useRef();

  const patterns = ['stripes', 'weave'];

  const { pixelSize, pattern } = useControls({
    pixelSize: {
      value: 8.0,
      min: 8.0,
      max: 32.0,
      step: 2.0,
    },
    pattern: {
      value: 'stripes',
      options: patterns,
    },
  });

  const patternIndex = patterns.indexOf(pattern);

  useFrame((state) => {
    const { camera } = state;

    if (effectRef.current) {
      effectRef.current.pixelSize = pixelSize;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <EffectComposer>
      <CustomPatternsEffect ref={effectRef} pixelSize={pixelSize} pattern={patternIndex} />
    </EffectComposer>
  );
};

const Patterns = () => {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[-0, 0, -5]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <Venus />
      <PatternsEffect />
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
          <color attach='background' args={['#010101']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, -5]} intensity={20.0} />
          <OrbitControls />
          <Patterns />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Patterns = {
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

export default Patterns;
