const FragmentShader = `uniform float pixelSize;

float crossSDF(vec2 p) {
    p = abs(p - 0.5);
    return min(p.x, p.y);
}

float circleSDF(vec2 p) {
    return length(p - 0.5);
}

float trangleSDF(vec2 p) {
    const float r = 1.0;
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0*r, 0.0 );
    return -length(p)*sign(p.y);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    float rowIndex = floor(uv.x / normalizedPixelSize.x);
    vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
    vec4 color = texture2D(inputBuffer, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
    
    vec2 cellUV = fract(uv / normalizedPixelSize);
    color = vec4(1.0);

    float d = circleSDF(cellUV);
    
    if (luma > 0.2) {
      if (d < 0.3) {
        color = vec4(0.0,0.31,0.933,1.0);
      } else {
        color = vec4(1.0,1.0,1.0,1.0);
      }
    }

    if(luma > 0.75) {
      if(d < 0.3) {
        color = vec4(1.0,1.0,1.0,1.0);
      } else {
        color = vec4(0.0,0.31,0.933,1.0);
      }
    }

    if(luma > 0.99) {
      color = vec4(0.0,0.31,0.933,1.0);
    }

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

class CustomPatternsEffectImpl extends Effect {
  constructor({ pixelSize = 1.0 }) {
    const uniforms = new Map([['pixelSize', new THREE.Uniform(pixelSize)]]);

    super('CustomPatternsEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
  }
}

const CustomPatternsEffect = wrapEffect(CustomPatternsEffectImpl);

export const PatternsEffect = () => {
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
      <CustomPatternsEffect ref={effectRef} pixelSize={pixelSize} />
    </EffectComposer>
  );
};

const Patterns = () => {
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
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 10, -5]} intensity={10.0} />
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
