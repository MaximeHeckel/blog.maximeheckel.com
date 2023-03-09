const AppCode = `import { OrbitControls, Sky, Environment, useFBO } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import './scene.css';

const InfinityMirror = () => {
  const mesh = useRef();
  const renderTarget = useFBO();
  const secondRenderTarget = useFBO();

  useFrame((state) => {
    const { gl, scene, camera } = state;

    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);

    mesh.current.material.map = renderTarget.texture;

    gl.setRenderTarget(secondRenderTarget);
    gl.render(scene, camera);

    mesh.current.material.map = secondRenderTarget.texture;

    gl.setRenderTarget(null);
  });


  return (
    <>
      <Sky sunPosition={[10, 10, 0]} />
      <directionalLight args={[10, 10, 0]} intensity={1} />
      <ambientLight intensity={0.5} />
      <Environment preset="sunset" />
      <mesh position={[-2, 0, 0]}>
        <dodecahedronGeometry args={[1]} />
        <meshPhysicalMaterial
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#73B9ED"
        />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <dodecahedronGeometry args={[1]} />
        <meshPhysicalMaterial
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#73B9ED"
        />
      </mesh>
      <mesh position={[2, 0, 0]}>
        <dodecahedronGeometry args={[1]} />
        <meshPhysicalMaterial
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#73B9ED"
        />
      </mesh>
      <mesh position={[0, -2, 0]}>
        <dodecahedronGeometry args={[1]} />
        <meshPhysicalMaterial
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#73B9ED"
        />
      </mesh>
      <mesh ref={mesh} scale={1}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} dpr={[1, 2]}>
      <InfinityMirror />
      <OrbitControls />
    </Canvas>
  );
};


export default Scene;
`;

const InfinityMirror = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
};

export default InfinityMirror;
