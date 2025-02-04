const FragmentShader = `uniform float pixelSize;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 rgbToHsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Function to convert HSV back to RGB
vec3 hsvToRgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}


void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
    vec4 color = texture(inputBuffer, uvPixel);

    vec2 cellPosition = floor(uv / normalizedPixelSize);
    vec2 cellUV = fract(uv / normalizedPixelSize);

    float rowOffset = sin((random(vec2(0.0, uvPixel.y)) - 0.5) * 0.25);
    cellUV.x += rowOffset; 
    vec2 centered = cellUV - 0.5;

    float noiseAmount = 0.18;
    vec2 noisyCenter = centered + (vec2(
        random(cellPosition + centered ),
        random(cellPosition + centered)
    ) - 0.5) * noiseAmount;

    float isAlternate = mod(cellPosition.x, 2.0);
    float angle = isAlternate == 0.0 ? radians(-65.0) : radians(65.0);
    
    vec2 rotated = vec2(
        noisyCenter.x * cos(angle) - noisyCenter.y * sin(angle),
        noisyCenter.x * sin(angle) + noisyCenter.y * cos(angle)
    );
    
    float aspectRatio = 1.55;
    float ellipse = length(vec2(rotated.x, rotated.y * aspectRatio - 0.075));
    color.rgb *= smoothstep(0.2, 1.0, 1.0 - ellipse);
    
    float stripeNoise = noise(vec2(centered.x, centered.y * 100.0)); 
    color.rgb *= stripeNoise + 0.4;
   

    float hueShift = (random(cellPosition) - 0.5) * 0.08;
    vec3 hsv = rgbToHsv(color.rgb);
    hsv.x += hueShift;
    color.rgb = hsvToRgb(hsv);

    color.rgb *= smoothstep(0.2, 1.0, 1.0 - ellipse);
    outputColor = color;
}
`;

const Model = `import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";


const Spaceship = () => {
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
    <group rotation={[Math.PI * 0.05, Math.PI * 0.4, 0]}>
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
      <directionalLight position={[5, 10, 5.95]} intensity={25.0} />
    </group>
  );
};

export { Spaceship };
`;

const AppCode = `import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import { Spaceship } from './Model';
import './scene.css';

class CustomCrochetEffectImpl extends Effect {
  constructor({ pixelSize = 1.0 }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
    ]);

    super('CustomCrochetEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
  }
}

const CustomCrochetEffect = wrapEffect(CustomCrochetEffectImpl);

export const CrochetEffect = () => {
  const effectRef = useRef();

  const { pixelSize } = useControls({
    pixelSize: {
      value: 16.0,
      min: 8.0,
      max: 32.0,
      step: 2.0,
    }
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
      <CustomCrochetEffect ref={effectRef} pixelSize={pixelSize} />
    </EffectComposer>
  );
};

const Crochet = () => {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <Spaceship />
      <CrochetEffect />
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
          <Crochet />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Crochet = {
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

export default Crochet;
