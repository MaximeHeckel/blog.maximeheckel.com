const AppCode = `import { OrbitControls, 
    Sky, 
    Environment, 
    useFBO,
    ContactShadows,
    PerspectiveCamera,
  } from "@react-three/drei";
  import { Canvas, useFrame, createPortal } from "@react-three/fiber";
  import { Leva, useControls } from "leva";
  import { useRef } from "react";
  import * as THREE from "three";
  import './scene.css';
  
  const Portal = () => {
    const mesh = useRef();
    const otherMesh = useRef();
    const otherCamera = useRef();
    const otherScene = new THREE.Scene();
  
    const renderTarget = useFBO();
  
    const { renderBox } = useControls({
      renderBox: {
        value: false
      }
    });
  
    useFrame((state) => {
      const { gl, clock, camera } = state;
      otherCamera.current.matrixWorldInverse.copy(camera.matrixWorldInverse);
  
      gl.setRenderTarget(renderTarget);
      gl.render(otherScene, otherCamera.current);
  
      mesh.current.material.map = renderTarget.texture;
  
      otherMesh.current.rotation.x = Math.cos(clock.elapsedTime / 2);
      otherMesh.current.rotation.y = Math.sin(clock.elapsedTime / 2);
      otherMesh.current.rotation.z = Math.sin(clock.elapsedTime / 2);
  
      gl.setRenderTarget(null);
    });
  
  
    return (
      <>
        <OrbitControls attach="orbitControls" />
        <PerspectiveCamera
          manual
          ref={otherCamera}
          aspect={1.5 / 1}
        />
        {createPortal(
          <>
            <Sky sunPosition={[10, 10, 0]} />
            <Environment preset="sunset" />
            <directionalLight args={[10, 10, 0]} intensity={1} />
            <ambientLight intensity={0.5} />
            <ContactShadows
              frames={1}
              scale={10}
              position={[0, -2, 0]}
              blur={8}
              opacity={0.75}
            />
            <group>
              <mesh ref={otherMesh}>
                <dodecahedronGeometry args={[1]} />
                <meshPhysicalMaterial
                  roughness={0}
                  clearcoat={1}
                  clearcoatRoughness={0}
                  color="#73B9ED"
                />
              </mesh>
              <mesh position={[-3, 1, -2]}>
                <dodecahedronGeometry args={[1]} />
                <meshPhysicalMaterial
                  roughness={0}
                  clearcoat={1}
                  clearcoatRoughness={0}
                  color="#73B9ED"
                />
              </mesh>
              <mesh position={[3, -1, -2]}>
                <dodecahedronGeometry args={[1]} />
                <meshPhysicalMaterial
                  roughness={0}
                  clearcoat={1}
                  clearcoatRoughness={0}
                  color="#73B9ED"
                />
              </mesh>
            </group>
          </>,
          otherScene
        )}
        <mesh ref={mesh}>
          { renderBox ?
            <boxGeometry args={[3, 2, 2]} />
            :
            <planeGeometry args={[3, 2]} />
          }
          <meshBasicMaterial color="white" />
        </mesh>
      </>
    );
  };
  
  const Scene = () => {
    return (
      <>
        <Leva collapsed />
        <Canvas camera={{ position: [0, 0, 3] }} dpr={[1, 2]}>
          <Portal />
          <OrbitControls />
        </Canvas>
      </>
    );
  };
  
  
  export default Scene;
  `;

const Portal = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
};

export default Portal;
