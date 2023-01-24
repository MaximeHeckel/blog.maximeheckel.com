const FragmentShader = `const fragmentShader = \`
uniform vec2 winResolution;
uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;

void main() {
  float iorRatio = 1.0/1.31;
  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec3 normal = worldNormal;
  vec3 refractVec = refract(eyeVector, normal, iorRatio);
  
  vec4 color = texture2D(uTexture, uv + refractVec.xy);
  
  gl_FragColor = color;
}
\`

export default fragmentShader
`;

const VertexShader = `const vertexShader = \`
varying vec3 worldNormal;
varying vec3 eyeVector;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;
  worldNormal = normalize(transformedNormal);

  eyeVector = normalize(worldPos.xyz - cameraPosition);
}

\`

export default vertexShader
`;

const AppCode = `import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import vertexShader from './vertexShader';
import fragmentShader from './fragmentShader';

const Geometries = () => {
  // This reference gives us direct access to our mesh
  const mesh = useRef();
  const backgroundGroup = useRef();
  
  // This is our main render target where we'll render and store the scene as a texture
  const mainRenderTarget = useFBO();

  const uniforms = useMemo(() => ({
    uTexture: {
      value: null,
    },
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
  });

  return (
    <>
      <color attach="background" args={["black"]} />
      <group ref={backgroundGroup}>
        <mesh position={[-4, -3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[4, -3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-5, 3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[5, 3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2, 20]} />
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
    <Canvas camera={{ position: [-3, 0, 6] }} dpr={[1, 2]}>
      <ambientLight intensity={1.0} />
      <Geometries />
      <OrbitControls />
    </Canvas>
  );
};


export default Scene;
`;

const SimpleRefractionFiles = {
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

export default SimpleRefractionFiles;
