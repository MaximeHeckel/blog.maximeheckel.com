const FragmentShader = `uniform float progress;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

const float LEVELS = 5.0;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float basePixelSize = pow(2.0, LEVELS);

  float currentLevel = floor(progress * LEVELS);  

  float currentPixelSize = max(basePixelSize / pow(2.0, currentLevel), 1.0);

  float currentPixelsPerRow = ceil(resolution.x / currentPixelSize);
  float currentPixelsPerCol = ceil(resolution.y / currentPixelSize);
  float currentTotalPixels = currentPixelsPerRow * currentPixelsPerCol;

  
  float levelProgress = fract(progress * LEVELS) * currentTotalPixels;

  float currentRowInLevel = floor(levelProgress / currentPixelsPerRow);
  float currentPixelInRow = mod(levelProgress, currentPixelsPerRow);
  
  vec2 gridPos = floor(uv * resolution / currentPixelSize);
  float row = floor(currentPixelsPerCol - gridPos.y - 1.0);
  float posInRow = floor(gridPos.x);
  
  vec4 additionalColor = vec4(0.0, 0.0, 0.0, 1.0);
  vec2 finalUv;
  vec2 finalNormalizedPixelSize;
  
  if (currentPixelSize <= 1.0) {
    finalUv = uv;
    additionalColor = vec4(0.0);
  } else if (row < currentRowInLevel || (row == currentRowInLevel && posInRow <= currentPixelInRow)) {
    finalNormalizedPixelSize = currentPixelSize / resolution;
    vec2 uvPixel = finalNormalizedPixelSize * floor(uv / finalNormalizedPixelSize);
    finalUv = uvPixel;
    
    if (row == currentRowInLevel) {
      float rand = random(vec2(posInRow, row));
      float twinkle = sin(time * 10.0 + rand * 10.0) + 1.0;
      additionalColor = vec4(0.005) * (twinkle * 20.0);
        
    }
  } else {
    float finalPixelSize = currentPixelSize * 2.0;
    finalNormalizedPixelSize = finalPixelSize / resolution;
    vec2 uvPixel = finalNormalizedPixelSize * floor(uv / finalNormalizedPixelSize);
    finalUv = uvPixel;
  }

  vec4 color = texture2D(inputBuffer, finalUv);
  outputColor = color + additionalColor;
}
`;

const AppCode = `import { OrbitControls, OrthographicCamera, Image } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { easing } from 'maath';
import { Effect } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import './scene.css';

class CustomDepixelationEffectImpl extends Effect {
  constructor({ progress = 0.5 }) {
    const uniforms = new Map([
      ['progress', new THREE.Uniform(progress)],
    ]);

    super('CustomDepixelationEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('progress').value = this.progress;
  }
}

const CustomDepixelationEffect = wrapEffect(CustomDepixelationEffectImpl);

const DepixelationEffect = () => {
  const effectRef = useRef();
  const smoothProgressRef = useRef(0);

  const { progress } = useControls({
    progress: {
      value: 0.0,
      min: 0.0,
      max: 1.0,
      step: 0.001,
    },
  });

  useFrame((state) => {
    const { camera } = state;

    easing.damp(smoothProgressRef, 'current', progress, 0.25);

    if (effectRef.current) {
      effectRef.current.progress = smoothProgressRef.current;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <EffectComposer>
      <CustomDepixelationEffect ref={effectRef} progress={progress} />
    </EffectComposer>
  );
};

const FullScreenImage = () => {
  const meshRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    const { camera } = state;
    meshRef.current.rotation.setFromQuaternion(camera.quaternion);
  });

  return (
    <Image
      ref={meshRef}
      scale={[viewport.width, viewport.height, 1.0]}
      url='https://cdn.maximeheckel.com/images/backgrounds/gril-with-pearl-earing.jpg'
    />
  );
};

const Depixelation = () => {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <FullScreenImage />
      <DepixelationEffect />
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
          <color attach='background' args={['#74B7FF']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, -5]} intensity={10.0} />
          <OrbitControls />
          <Depixelation />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Depixelation = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Depixelation;
