const FragmentShader = `precision highp float;

uniform float matrixSize;
uniform float bias;

const mat2x2 bayerMatrix2x2 = mat2x2(
    0.0, 2.0,
    3.0, 1.0
) / 4.0;

const mat4x4 bayerMatrix4x4 = mat4x4(
    0.0,  8.0,  2.0, 10.0,
    12.0, 4.0,  14.0, 6.0,
    3.0,  11.0, 1.0, 9.0,
    15.0, 7.0,  13.0, 5.0
) / 16.0;

const float bayerMatrix8x8[64] = float[64](
    0.0/ 64.0, 48.0/ 64.0, 12.0/ 64.0, 60.0/ 64.0,  3.0/ 64.0, 51.0/ 64.0, 15.0/ 64.0, 63.0/ 64.0,
  32.0/ 64.0, 16.0/ 64.0, 44.0/ 64.0, 28.0/ 64.0, 35.0/ 64.0, 19.0/ 64.0, 47.0/ 64.0, 31.0/ 64.0,
    8.0/ 64.0, 56.0/ 64.0,  4.0/ 64.0, 52.0/ 64.0, 11.0/ 64.0, 59.0/ 64.0,  7.0/ 64.0, 55.0/ 64.0,
  40.0/ 64.0, 24.0/ 64.0, 36.0/ 64.0, 20.0/ 64.0, 43.0/ 64.0, 27.0/ 64.0, 39.0/ 64.0, 23.0/ 64.0,
    2.0/ 64.0, 50.0/ 64.0, 14.0/ 64.0, 62.0/ 64.0,  1.0/ 64.0, 49.0/ 64.0, 13.0/ 64.0, 61.0/ 64.0,
  34.0/ 64.0, 18.0/ 64.0, 46.0/ 64.0, 30.0/ 64.0, 33.0/ 64.0, 17.0/ 64.0, 45.0/ 64.0, 29.0/ 64.0,
  10.0/ 64.0, 58.0/ 64.0,  6.0/ 64.0, 54.0/ 64.0,  9.0/ 64.0, 57.0/ 64.0,  5.0/ 64.0, 53.0/ 64.0,
  42.0/ 64.0, 26.0/ 64.0, 38.0/ 64.0, 22.0/ 64.0, 41.0/ 64.0, 25.0/ 64.0, 37.0/ 64.0, 21.0 / 64.0
);

vec3 orderedDither(vec2 uv, float lum) {
  vec3 color = vec3(0.0);

  float threshold = 0.0;

  if (matrixSize == 2.0) {
    int x = int(uv.x * resolution.x) % 2;
    int y = int(uv.y * resolution.y) % 2;
    threshold = bayerMatrix2x2[y][x];
  }

  if (matrixSize == 4.0) {
    int x = int(uv.x * resolution.x) % 4;
    int y = int(uv.y * resolution.y) % 4;
    threshold = bayerMatrix4x4[y][x];
  }

  if (matrixSize == 8.0) {
    int x = int(uv.x * resolution.x) % 8;
    int y = int(uv.y * resolution.y) % 8;
    threshold = bayerMatrix8x8[y * 8 + x];
  }

  if (lum < threshold + bias) {
      color = vec3(0.0);
  } else {
      color = vec3(1.0); 
  }

  return color;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 color = texture2D(inputBuffer, uv);

  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
  color.rgb = orderedDither(uv, lum);

  outputColor = color;
}`;

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { wrapEffect, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { Effect } from "postprocessing";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import fragmentShader from "!!raw-loader!./fragmentShader.glsl";
import './scene.css';

class RetroEffectImpl extends Effect {
  constructor({ matrixSize = 8.0, bias = 0.5 }) {
    const uniforms = new Map([
      ["matrixSize", new THREE.Uniform(8.0)],
      ["bias", new THREE.Uniform(0.5)],
    ]);

    super("RetroEffect", fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  set matrixSize(value) {
    this.uniforms.get("matrixSize").value = value;
  }

  get matrixSize() {
    return this.uniforms.get("matrixSize").value;
  }

  set bias(value) {
    this.uniforms.get("bias").value = value;
  }

  get bias() {
    return this.uniforms.get("bias").value;
  }
}

const RetroEffect = wrapEffect(RetroEffectImpl);

const Retro = () => {
  const mesh = useRef();
  const effect = useRef();

  const { matrixSize, bias } = useControls({
    matrixSize: {
      value: "8.0",
      options: ["2.0", "4.0", "8.0"],
    },
    bias: {
      value: 0.70,
      min: 0.0,
      max: 1.0,
    },
  });

  useFrame(() => {
    effect.current.matrixSize = parseInt(matrixSize, 10);
    effect.current.bias = bias;
  })

  return (
    <>
      <mesh receiveShadow castShadow>
        <torusKnotGeometry args={[1, 0.25, 128, 100]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      <EffectComposer>
        <RetroEffect ref={effect} />
      </EffectComposer>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback="Loading">
        <ambientLight intensity={0.25} />
        <directionalLight position={[0, 10, 5]} intensity={10.5} />
        <color attach="background" args={["#000000"]} />
        <Retro />
        <OrbitControls />
        <OrthographicCamera
          makeDefault
          position={[5, 5, 5]}
          zoom={120}
          near={0.01}
          far={500}
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;`;

const Ordered = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Ordered;
