const FragmentShader = `uniform float pixelSize;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  float rowIndex = floor(uv.x / normalizedPixelSize.x);
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec4 color = texture2D(inputBuffer, uvPixel);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

  vec2 cellUV = fract(uv / normalizedPixelSize);
  float lineWidth = 0.0; // Width varies with luminance

  if (luma > 0.0) {
    lineWidth = 1.0;
  }

  if (luma > 0.3) {
    lineWidth = 0.7;
  }

  if (luma > 0.5) {
    lineWidth = 0.5;
  }

  if (luma > 0.7) {
    lineWidth = 0.3;
  }

  if (luma > 0.9) {
    lineWidth = 0.1;
  }

  if (luma > 0.99) {
    lineWidth = 0.0;
  }

  float yStart = 0.05; // (1.0 - 0.8) * 0.5 to center vertically
  float yEnd = 0.95;   // yStart + 0.8
  // Adjust line height based on luminance

  // Draw vertical line
  if (cellUV.y > yStart && cellUV.y < yEnd && cellUV.x > 0.0 && cellUV.x < lineWidth) {
    color = vec4(0.0, 0.0, 0.0, 1.0); // Black line
  } else {
    color = vec4(0.70,0.74,0.73, 1.0); // White background
  }
  outputColor = color;
}
`;

const AppCode = `import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva,useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import './scene.css';

class CustomReceiptEffectImpl extends Effect {
  constructor({ pixelSize = 1.0 }) {
    const uniforms = new Map([['pixelSize', new THREE.Uniform(pixelSize)]]);

    super('MyCustomEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
  }
}

const CustomReceiptEffect = wrapEffect(CustomReceiptEffectImpl);

export const ReceiptEffect = () => {
  const effectRef = useRef();

  const { pixelSize } = useControls({
    pixelSize: {
      value: 8.0,
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
      <CustomReceiptEffect ref={effectRef} pixelSize={pixelSize} />
    </EffectComposer>
  );
};



const Receipt = () => {
  

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[-0, 0, -5]}
        zoom={100}
        near={0.01}
        far={500}
      />

      <mesh>
        <torusKnotGeometry args={[1, 0.4, 100, 16]} color='orange' />
        <meshStandardMaterial color='orange' />
      </mesh>
      <ReceiptEffect />
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
          <color attach='background' args={['#ffffff']} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, -5]} intensity={8.0} />
          <OrbitControls />
          <Receipt />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Receipt = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Receipt;
