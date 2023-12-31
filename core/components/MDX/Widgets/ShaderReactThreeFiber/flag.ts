const FragmentShader = `
void main() {
  gl_FragColor = vec4(0.0, 0.3, 1.0, 1.0);
}
`;

const VertexShader = `
void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(modelPosition.x * 4.0) * 0.2;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`;

const AppCode = `import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color } from "three";
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const Flag = () => {
  // This reference will give us direct access to the mesh
  const mesh = useRef();

  return (
    <mesh ref={mesh} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.5}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        wireframe
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [1.0, 1.0, 1.0] }}>
      <Flag />
      <axesHelper />
      <OrbitControls />
    </Canvas>
  );
};


export default Scene;
`;

const FlagFiles = {
  '/App.js': {
    code: AppCode,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
    active: true,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    hidden: true,
  },
};

export default FlagFiles;
