const AppCode = `import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, Vector3, Quaternion } from "three";
import './scene.css';

const TwistedBox = () => {
  // This reference gives us direct access to the mesh
  const mesh = useRef();
  const quaternion = new Quaternion();

  useEffect(() => {
    // Get the current attributes of the geometry
    const currentPositions = mesh.current.geometry.attributes.position;
    // Copy the attributes
    const originalPositions = currentPositions.clone();
    const originalPositionsArray = originalPositions?.array || [];

    // Go through each vector (series of 3 values) and modify the values
    for (let i = 0; i < originalPositionsArray.length; i=i+3) {
      const modifiedPositionVector = new Vector3(originalPositionsArray[i], originalPositionsArray[i+1], originalPositionsArray[i+2]);
      const upVector = new Vector3(0, 1, 0);

      // Rotate along the y axis (0, 1, 0)
      quaternion.setFromAxisAngle(
        upVector, 
        (Math.PI / 180) * (modifiedPositionVector.y + 10) * 100 // the higher along the y axis the vertex is, the more we rotate
      );
      modifiedPositionVector.applyQuaternion(quaternion);

      // Apply the modified position vector coordinates to the current position attributes array
      currentPositions.array[i] = modifiedPositionVector.x 
      currentPositions.array[i+1] = modifiedPositionVector.y
      currentPositions.array[i+2] = modifiedPositionVector.z
    }
    // Set the needsUpdate flag to "true"
    currentPositions.needsUpdate = true;
  }, [])

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1, 10, 10, 10]} />
      <meshLambertMaterial color="hotpink" emissive="hotpink" />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [1.5, 1.5, 1.5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-1, 2, 2]} intensity={4} />
      <TwistedBox />
      <OrbitControls autoRotate />
    </Canvas>
  );
};


export default Scene;
`;

const TwistFile = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
};

export default TwistFile;
