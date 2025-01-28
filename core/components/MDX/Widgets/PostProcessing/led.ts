const FragmentShader = `uniform float pixelSize;
uniform float maskStagger;

const float MASK_BORDER = 0.9;
const float MASK_INTENSITY = 1.25;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 coord = uv/normalizedPixelSize;
  
  float columnStagger = mod(floor(coord.x), 2.0) * maskStagger;
  vec2 subcoord = coord * vec2(3,1);
  float subPixelIndex = mod(floor(subcoord.x), 3.0);
  float subPixelStagger = subPixelIndex * maskStagger;

  vec2 offsetUV = uv;
  offsetUV.y += (columnStagger + subPixelStagger) * normalizedPixelSize.y;

  vec2 uvPixel = normalizedPixelSize * floor(offsetUV / normalizedPixelSize);
  vec4 color = texture2D(inputBuffer, uvPixel);
  
  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

  vec2 cellOffset = vec2(0.0, columnStagger + subPixelStagger);
  vec3 maskColor = vec3(1.0, 0.0, 0.0);
  vec2 subCellUV = fract(subcoord + cellOffset) * 2.0 - 1.0;


  vec2 border = 1.0 - subCellUV * subCellUV * (MASK_BORDER - luma * 0.25);
  maskColor.rgb *= border.x * border.y;
  float maskStrength = smoothstep(0.0, 0.95, maskColor.r);

  color += 0.005;
  color.rgb *=  1.0 + (maskStrength - 1.0) * MASK_INTENSITY;

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
      <meshStandardMaterial color='#85B3FC' />
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

class CustomLEDEffectImpl extends Effect {
  constructor({ pixelSize = 1.0, maskStagger = 0.5 }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
      ['maskStagger', new THREE.Uniform(maskStagger)],
    ]);

    super('CustomLEDEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
    this.uniforms.get('maskStagger').value = this.maskStagger;
  }
}

const CustomLEDEffect = wrapEffect(CustomLEDEffectImpl);

export const LEDEffect = () => {
  const effectRef = useRef();

  const { pixelSize, maskStagger } = useControls({
    pixelSize: {
      value: 8.0,
      min: 8.0,
      max: 32.0,
      step: 2.0,
    },
    maskStagger: {
      value: 0.5,
      min: 0.0,
      max: 1.0,
      step: 0.01,
    },
  });

  useFrame((state) => {
    const { camera } = state;

    if (effectRef.current) {
      effectRef.current.pixelSize = pixelSize;
      effectRef.current.maskStagger = maskStagger;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <EffectComposer>
      <CustomLEDEffect ref={effectRef} pixelSize={pixelSize} maskStagger={maskStagger} />
    </EffectComposer>
  );
};

const LED = () => {
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
      <LEDEffect />
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
          <directionalLight position={[5, 10, -5]} intensity={10.0} />
          <OrbitControls />
          <LED />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const LED = {
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

export default LED;
