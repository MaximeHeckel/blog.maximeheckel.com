const FragmentShader = `precision highp float;

uniform float colorNum;
uniform float pixelSize;
uniform bool blending;
uniform float curve;

float random(vec2 c) {
  return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f*f*(3.0-2.0*f);
  
  return mix(a, b, u.x) +
  (c - a)* u.y * (1.0 - u.x) +
  (d - b) * u.x * u.y;
}

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

vec3 dither(vec2 uv, vec3 color) {
  int x = int(uv.x * resolution.x) % 8;
  int y = int(uv.y * resolution.y) % 8;
  float threshold = bayerMatrix8x8[y * 8 + x];

  color.rgb += threshold * 0.6;
  color.r = floor(color.r * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
  color.g = floor(color.g * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
  color.b = floor(color.b * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);

  return color;
}

const float MASK_BORDER = .9;
const float MASK_INTENSITY = 0.6;
const float SPREAD = 0.0025;

void mainUv(inout vec2 uv) {
  float shake = (noise(vec2(uv.y) * sin(time * 400.0) * 100.0) - 0.5) * 0.0025;
  uv.x += shake * 1.5;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 curveUV = uv * 2.0 - 1.0;
  vec2 offset = curveUV.yx * curve;
  curveUV += curveUV * offset * offset;
  curveUV = curveUV * 0.5 + 0.5;

  // XOR shader CRT mask
  vec2 pixel = uv * resolution;
  vec2 coord = pixel / pixelSize;
  vec2 subcoord = coord * vec2(3,1);
  vec2 cellOffset = vec2(0, mod(floor(coord.x), 3.0) * 0.5);

  float ind = mod(floor(subcoord.x), 3.0);
  vec3 maskColor = vec3(ind == 0.0, ind == 1.0, ind == 2.0) * 2.0;

  vec2 cellUV = fract(subcoord + cellOffset) * 2.0 - 1.0;
  vec2 border = 1.0 - cellUV * cellUV * MASK_BORDER;
  maskColor.rgb *= border.x * border.y;

  vec2 rgbCellUV = floor(coord+cellOffset) * pixelSize / resolution;

  vec4 color = vec4(1.0);
  color.r = texture2D(inputBuffer, rgbCellUV + SPREAD).r;
  color.g = texture2D(inputBuffer, rgbCellUV).g;
  color.b = texture2D(inputBuffer, rgbCellUV - SPREAD).b;
  
  color.rgb = dither(rgbCellUV, color.rgb);

  if(blending) {
    color.rgb *= 1.0 + (maskColor - 1.0) * MASK_INTENSITY;
  } else {
    color.rgb *= maskColor;
  }

  float lines = sin(uv.y * 2150.0 + time * 100.0);
  color *= lines + 1.0;

  vec2 edge = smoothstep(0., 0.02, curveUV)*(1.-smoothstep(1.-0.02, 1., curveUV));
  color.rgb *= edge.x * edge.y;

  outputColor = color;
}`;

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { wrapEffect, EffectComposer, Bloom } from "@react-three/postprocessing";
import { useControls } from "leva";
import { Effect, KernelSize, Resolution } from "postprocessing";
import { Suspense, useEffect, useRef, useState, forwardRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import fragmentShader from "!!raw-loader!./fragmentShader.glsl";
import './scene.css';

class RetroEffectImpl extends Effect {
  constructor() {
    const uniforms = new Map([
      ["colorNum", new THREE.Uniform(8.0)],
      ["pixelSize", new THREE.Uniform(2.0)],
      ["blending", new THREE.Uniform(true)],
      ["curve", new THREE.Uniform(0.25)],
    ]);

    super("RetroEffect", fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  set blending(value) {
    this.uniforms.get("blending").value = value;
  }

  get blending() {
    return this.uniforms.get("blending").value;
  }

  set curve(value) {
    this.uniforms.get("curve").value = value;
  }

  get curve() {
    return this.uniforms.get("curve").value;
  }

  set colorNum(value) {
    this.uniforms.get("colorNum").value = value;
  }

  get colorNum() {
    return this.uniforms.get("colorNum").value;
  }

  set pixelSize(value) {
    this.uniforms.get("pixelSize").value = value;
  }

  get pixelSize() {
    return this.uniforms.get("pixelSize").value;
  }
}

const RetroEffect = wrapEffect(RetroEffectImpl);

const Spaceship = forwardRef((_, ref) => {
  // Original model by Sousinho
  // Their work: https://sketchfab.com/sousinho
  // The original model: https://sketchfab.com/3d-models/rusty-spaceship-orange-18541ebed6ce44a9923f9b8dc30d87f5
  const gltf = useGLTF("https://cdn.maximeheckel.com/models/spaceship-optimized.glb");

  useEffect(() => {
    if (gltf) {
      function alphaFix(material) {
        material.transparent = true;
        material.alphaToCoverage = true;
        material.depthFunc = THREE.LessEqualDepth;
        material.depthTest = true;
        material.depthWrite = true;
      }
      alphaFix(gltf.materials.spaceship_racer);
      alphaFix(gltf.materials.cockpit);
    }
  }, [gltf]);

  return (
    <group ref={ref}>
      <group
        scale={0.005}
        rotation={[0, -Math.PI * 0.5, 0]}
        position={[1.583, 0, -3.725]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube001_spaceship_racer_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, -64.81, 64.77]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube005_cockpit_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, 0, 0]}
        />
      </group>
    </group>
  );
});

const Retro = () => {
  const spaceship = useRef();
  const effect = useRef();

  const { colorNum, pixelSize } = useControls({
    colorNum: {
      value: "16.0",
      options: ["2.0", "4.0", "8.0", "16.0"],
    },
    pixelSize: {
      value: "4.0",
      options: ["4.0", "8.0", "16.0", "32.0"],
    },
  });

  useFrame((state) => {
    const { camera, clock } = state;

    effect.current.colorNum = parseInt(colorNum, 10);
    effect.current.pixelSize = parseInt(pixelSize, 10);

    spaceship.current.rotation.x =
      Math.cos(state.clock.getElapsedTime()) *
      Math.cos(state.clock.getElapsedTime()) *
      0.15;
    spaceship.current.position.y =
      Math.sin(state.clock.getElapsedTime() * 1.0) + 0.5;

    camera.lookAt(0, 0, 0);
  })

  return (
    <>
      <group rotation={[0, Math.PI / 2, 0]}>
        <Spaceship ref={spaceship} />
      </group>
      <EffectComposer>
        <RetroEffect ref={effect} />
        <Bloom intensity={0.25} luminanceThreshold={0.05} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback="Loading">
        <color attach="background" args={["#3386E0"]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[0, 10, 5]} intensity={10.5} />
        <Retro />
        <OrbitControls />
        <OrthographicCamera
          makeDefault
          position={[5, 5, 5]}
          zoom={50}
          near={0.01}
          far={500}
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;`;

const curve = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default curve;
