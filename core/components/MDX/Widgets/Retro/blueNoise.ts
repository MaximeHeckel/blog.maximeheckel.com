const FragmentShader = `precision highp float;
uniform sampler2D noise;
uniform float bias;

vec3 blueNoiseDither(vec2 uv, float lum) {
  vec3 color = vec3(0.0);

  float threshold = texture2D(noise, gl_FragCoord.xy / 128.0).r;

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
  color.rgb = blueNoiseDither(uv, lum);

  outputColor = color;
}`;

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
  useTexture,
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
  constructor({ bias = 0.85 }) {
    const uniforms = new Map([
      ["noise", new THREE.Uniform(null)],
      ["bias", new THREE.Uniform(0.85)],
    ]);

    super("RetroEffect", fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  get noise() {
    return this.uniforms.get("noise").value;
  }

  set noise(value) {
    this.uniforms.get("noise").value = value;
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

  const texture = useTexture("https://cdn.maximeheckel.com/noises/bn.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

   const { bias } = useControls({
    bias: {
      value: 0.85,
      min: 0.0,
      max: 1.0,
    },
  });

  useFrame(() => {
    effect.current.noise = texture;
    effect.current.bias = bias;
  })

  return (
    <>
      <mesh receiveShadow castShadow>
        <torusKnotGeometry args={[1, 0.25, 128, 100]} />
        <meshStandardMaterial color="#58A4FE" />
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

const BlueNOise = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default BlueNOise;
