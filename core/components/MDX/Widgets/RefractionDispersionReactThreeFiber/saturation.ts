const FragmentShader = `uniform float uIorR;
uniform float uIorG;
uniform float uIorB;
uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform vec2 winResolution;
uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;

vec3 sat(vec3 rgb, float intensity) {
  vec3 L = vec3(0.2125, 0.7154, 0.0721);
  vec3 grayscale = vec3(dot(rgb, L));
  return mix(grayscale, rgb, intensity);
}

const int LOOP = 16;

void main() {
  float iorRatioRed = 1.0/uIorR;
  float iorRatioGreen = 1.0/uIorG;
  float iorRatioBlue = 1.0/uIorB;

  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec3 normal = worldNormal;
  vec3 color = vec3(0.0);

  for ( int i = 0; i < LOOP; i ++ ) {
    float slide = float(i) / float(LOOP) * 0.1;

    vec3 refractVecR = refract(eyeVector, normal, iorRatioRed);
    vec3 refractVecG = refract(eyeVector, normal, iorRatioGreen);
    vec3 refractVecB = refract(eyeVector, normal, iorRatioBlue);
    
    color.r += texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).r;
    color.g += texture2D(uTexture, uv + refractVecG.xy * (uRefractPower + slide * 2.0) * uChromaticAberration).g;
    color.b += texture2D(uTexture, uv + refractVecB.xy * (uRefractPower + slide * 3.0) * uChromaticAberration).b;

    color = sat(color, uSaturation);
  }

  // Divide by the number of layers to normalize colors (rgb values can be worth up to the value of LOOP)
  color /= float( LOOP );


  gl_FragColor = vec4(color, 1.0);
}
`;

const VertexShader = `varying vec3 worldNormal;
varying vec3 eyeVector;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;
  worldNormal = normalize(transformedNormal);

  eyeVector = normalize(worldPos.xyz - cameraPosition);
}
`;

const UtilsCode = `
  // Range from https://www.joshwcomeau.com/snippets/javascript/range/
  export const range = (start, end, step = 1) => {
    let output = [];
    if (typeof end === "undefined") {
      end = start;
      start = 0;
    }
    for (let i = start; i <= end; i += step) {
      output.push(i);
    }
    return output;
  };
`;

const AppCode = `import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva, folder, useControls } from "leva";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { range } from './utils';
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const Geometries = () => {
  // This reference gives us direct access to our mesh
  const mesh = useRef();
  const backgroundGroup = useRef();
  
  // This is our main render target where we'll render and store the scene as a texture
  const mainRenderTarget = useFBO();

  const {
    iorR,
    iorG,
    iorB,
    saturation,
    chromaticAberration,
    refraction
  } = useControls({
    ior: folder({
      iorR: { min: 1.0, max: 2.333, step: 0.001, value: 1.15 },
      iorG: { min: 1.0, max: 2.333, step: 0.001, value: 1.18 },
      iorB: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
    }),
    saturation: { value: 1.06, min: 1, max: 1.25, step: 0.01 },
    chromaticAberration: {
      value: 0.5,
      min: 0,
      max: 1.5,
      step: 0.01,
    },
    refraction: {
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.01,
    },
  })

  const uniforms = useMemo(() => ({
    uTexture: {
      value: null,
    },
    uIorR: {
      value: 1.0,
    },
    uIorG: {
      value: 1.0,
    },
    uIorB: {
      value: 1.0,
    },
    uRefractPower: {
      value: 0.2,
    },
    uChromaticAberration: {
      value: 1.0
    },
    uSaturation: { value: 0.0 },
    winResolution: {
      value: new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ).multiplyScalar(Math.min(window.devicePixelRatio, 2)), // if DPR is 3 the shader glitches 🤷‍♂️
    },
  }), [])

  useFrame((state) => {
    const { gl, scene, camera } = state;
    mesh.current.visible = false;
    gl.setRenderTarget(mainRenderTarget);
    gl.render(scene, camera);

    mesh.current.material.uniforms.uTexture.value = mainRenderTarget.texture;

    gl.setRenderTarget(null);
    mesh.current.visible = true;

    mesh.current.material.uniforms.uIorR.value = iorR;
    mesh.current.material.uniforms.uIorG.value = iorG;
    mesh.current.material.uniforms.uIorB.value = iorB;

    mesh.current.material.uniforms.uSaturation.value = saturation;
    mesh.current.material.uniforms.uChromaticAberration.value = chromaticAberration;
    mesh.current.material.uniforms.uRefractPower.value = refraction;
  });

  const columns = range(-7.5, 7.5, 2.5);
  const rows = range(-7.5, 7.5, 2.5);

  return (
    <>
      <color attach="background" args={["black"]} />
      <group ref={backgroundGroup}>
        {columns.map((col, i) =>
          rows.map((row, j) => (
            <mesh position={[col, row, -4]}>
              <icosahedronGeometry args={[0.5, 8]} />
              <meshStandardMaterial color="white" />
            </mesh>
          ))
        )}
      </group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2.84, 20]} />
        <shaderMaterial
          key={uuidv4()}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Leva collapsed />
      <Canvas camera={{ position: [-3, 0, 6] }} dpr={[1, 2]}>
        <ambientLight intensity={1.0} />
        <Geometries />
        <OrbitControls />
      </Canvas>
    </>
  );
};

export default Scene;
`;

const SaturationFiles = {
  '/App.js': {
    code: AppCode,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
  '/utils.js': {
    code: UtilsCode,
    hidden: true,
  },
};

export default SaturationFiles;
