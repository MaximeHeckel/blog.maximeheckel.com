const FragmentShader = `precision highp float;

float random(vec2 c) {
  return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 whiteNoiseDither(vec2 uv, float lum) {
  vec3 color = vec3(0.0);

  if (lum < random(uv)) {
      color = vec3(0.0);
  } else {
      color = vec3(1.0); 
  }

  return color;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 color = texture2D(inputBuffer, uv);

  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
  color.rgb = whiteNoiseDither(uv, lum);

  outputColor = color;
}`;

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { wrapEffect, EffectComposer } from "@react-three/postprocessing";
import { Effect } from "postprocessing";
import { Suspense, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

import './scene.css';

class RetroEffectImpl extends Effect {
  constructor() {
    super("RetroEffect", fragmentShader, {
      uniforms: new Map([]),
    });
  }
}

const RetroEffect = wrapEffect(RetroEffectImpl);

const Retro = () => {
  const mesh = useRef();

  return (
    <>
      <mesh receiveShadow castShadow>
        <torusKnotGeometry args={[1, 0.25, 128, 100]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      <EffectComposer>
        <RetroEffect />
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

const PostProcessing = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
  },
};

export default PostProcessing;
