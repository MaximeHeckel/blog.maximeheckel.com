const NormalMaterial = `import { shaderMaterial } from "@react-three/drei";

const surfaceVertex = \`
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);

  // Set the final position of the vertex
  gl_Position = projectionMatrix * modelViewPosition;
}
\`;

const surfaceFragment = \`
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
\`;

const NormalMaterial = shaderMaterial({}, surfaceVertex, surfaceFragment);

export default NormalMaterial;
`;

const AppCode = `import { 
  OrbitControls, 
  Environment, 
  MeshTransmissionMaterial,
  PerspectiveCamera,
  useFBO,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef, useState } from "react";
import * as THREE from "three";

import NormalMaterial from "./NormalMaterial";

import './scene.css';

const config = {
  backsideThickness: 0.3,
  thickness: 25,
  samples: 6,
  transmission: 0.9,
  clearcoat: 1,
  clearcoatRoughness: 0.5,
  chromaticAberration: 1.5,
  anisotropy: 0.2,
  roughness: 0,
  distortion: 0,
  distortionScale: 0.09,
  temporalDistortion: 0,
  ior: 1.5,
  color: "#ffffff",
};

const Caustics = () => {
  const mesh = useRef();
  const causticsPlane = useRef();

  const {
    light,
  } = useControls({
    light: {
      value: new THREE.Vector3(-10, 13, -10),
    },
  });

  const normalRenderTarget = useFBO(2000, 2000, {});

  const [normalCamera] = useState(
    () => new THREE.PerspectiveCamera(65, 1, 0.1, 1000)
  );

  const [normalMaterial] = useState(() => new NormalMaterial());

  useFrame((state) => {
    const { gl } = state;

    const bounds = new THREE.Box3().setFromObject(mesh.current, true);

    normalCamera.position.set(light.x, light.y, light.z);
    normalCamera.lookAt(
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).x,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).y,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).z
    );
    normalCamera.up = new THREE.Vector3(0, 1, 0);

    const originalMaterial = mesh.current.material;

    mesh.current.material = normalMaterial;
    mesh.current.material.side = THREE.BackSide;

    gl.setRenderTarget(normalRenderTarget);
    gl.render(mesh.current, normalCamera);

    mesh.current.material = originalMaterial;

    causticsPlane.current.material.map = normalRenderTarget.texture;

    gl.setRenderTarget(null);
  });

  return (
    <>
      <mesh
        ref={mesh}
        scale={0.02}
        position={[0, 6.5, 0]}
      >
        <torusKnotGeometry args={[200, 40, 600, 16]} />
        <MeshTransmissionMaterial backside {...config} />
      </mesh>
      <mesh ref={causticsPlane} rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, 5]}>
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas dpr={[1, 2]}>
      <Caustics />
      <OrbitControls />
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={65} />
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/syferfontein_0d_clear_puresky_1k.hdr"
        ground={{ height: 45, radius: 100, scale: 300 }}
      />
    </Canvas>
  );
};


export default Scene;
`;

const NormalProjection = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
  '/NormalMaterial.js': {
    code: NormalMaterial,
  },
};

export default NormalProjection;
