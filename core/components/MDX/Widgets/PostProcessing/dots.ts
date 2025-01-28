const FragmentShader = `uniform float pixelSize;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    float rowIndex = floor(uv.x / normalizedPixelSize.x);
    vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
    vec4 color = texture2D(inputBuffer, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

    vec2 cellUV = fract(uv / normalizedPixelSize);

    float radius = luma > 0.5 ? 0.3 : luma > 0.001 ? 0.12 : 0.075;
    vec2 circleCenter = luma > 0.5 ? vec2(0.5, 0.5) : vec2(0.25, 0.25);

    float distanceFromCenter = distance(cellUV, circleCenter);

    float circleMask = smoothstep(radius, radius - 0.05, distanceFromCenter);
    color.rgb = vec3(circleMask, circleMask, circleMask) * max(luma, 0.05);

    outputColor = color;
}
`;

const Model = `import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

const CreationOfAdam = () => {
  const meshRef = useRef();

  const { scene } = useGLTF('https://cdn.maximeheckel.com/models/creation-of-adam.glb');

  useEffect(() => {
    meshRef.current.position.set(2.25, -2, 0);
    meshRef.current.rotation.y = -Math.PI / 2;
    meshRef.current.scale.setScalar(4);
  }, []);

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
};

export { CreationOfAdam };
`;

const AppCode = `import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import { CreationOfAdam } from './Model';
import './scene.css';

class CustomDotsEffectImpl extends Effect {
  constructor({ pixelSize = 1.0 }) {
    const uniforms = new Map([['pixelSize', new THREE.Uniform(pixelSize)]]);

    super('CustomDotsEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
  }
}

const CustomDotsEffect = wrapEffect(CustomDotsEffectImpl);

export const DotsEffect = () => {
  const effectRef = useRef();

  const { pixelSize } = useControls({
    pixelSize: {
      value: 10.0,
      min: 8.0,
      max: 32.0,
      step: 2.0,
    },
  });

  useFrame((state) => {
    const { camera } = state;

    if (effectRef.current) {
      effectRef.current.pixelSize = pixelSize;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <EffectComposer>
      <CustomDotsEffect ref={effectRef} pixelSize={pixelSize} />
    </EffectComposer>
  );
};

const Dots = () => {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[-0, 0, -5]}
        zoom={150}
        near={0.01}
        far={500}
      />
      <CreationOfAdam />
      <DotsEffect />
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
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 10, 0]} intensity={10.0} />
          <OrbitControls />
          <Dots />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Dots = {
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

export default Dots;
