const FragmentShader = `const fragmentShader = \`
varying vec2 vUv;

vec3 colorA = vec3(0.912,0.191,0.652);
vec3 colorB = vec3(1.000,0.777,0.052);

void main() {
  vec3 color = mix(colorA, colorB, vUv.x);

  gl_FragColor = vec4(color,1.0);
}

\`

export default fragmentShader
`;

const VertexShader = `const vertexShader = \`
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

\`

export default vertexShader
`;

const AppCode = `import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color } from "three";
import './scene.css';

import vertexShader from './vertexShader';
import fragmentShader from './fragmentShader';

const MovingPlane = () => {
  // This reference will give us direct access to the mesh
  const mesh = useRef();

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={1.0}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0.0, 0.0, 1.0] }}>
      <MovingPlane />
      <OrbitControls />
    </Canvas>
  );
};


export default Scene;
`;

const GradientFiles = {
  '/App.js': {
    code: AppCode,
  },
  '/vertexShader.js': {
    code: VertexShader,
  },
  '/fragmentShader.js': {
    code: FragmentShader,
    active: true,
  },
};

export default GradientFiles;
