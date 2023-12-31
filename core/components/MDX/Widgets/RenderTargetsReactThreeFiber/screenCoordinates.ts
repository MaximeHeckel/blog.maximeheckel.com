const FragmentShader = `uniform vec2 winResolution;
uniform sampler2D uTexture;

vec4 fromLinear(vec4 linearRGB) {
    bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
    vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
    vec3 lower = linearRGB.rgb * vec3(12.92);

    return vec4(mix(higher, lower, cutoff), linearRGB.a);
}


void main() {
  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec4 color = fromLinear(texture2D(uTexture, uv));

  gl_FragColor = color;
}
`;

const VertexShader = `
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;
}
`;

const AppCode = `import { OrbitControls, 
  Sky, 
  Environment, 
  useFBO,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame, createPortal } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const ScreenCoordinates = () => {
  const mesh = useRef();
  const otherMesh = useRef();
  const otherCamera = useRef();
  const otherScene = new THREE.Scene();

  const renderTarget = useFBO();

  const uniforms = useMemo(
    () => ({
      uTexture: {
        value: null,
      },
      winResolution: {
        value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
      },
    }),
    []
  );

  useFrame((state) => {
    const { gl, clock } = state;
    // otherCamera.current.lookAt(0, 0, 0);

    gl.setRenderTarget(renderTarget);
    gl.render(otherScene, otherCamera.current);

    mesh.current.material.uniforms.uTexture.value = renderTarget.texture;
    mesh.current.material.uniforms.winResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    ).multiplyScalar(Math.min(window.devicePixelRatio, 2));

    otherMesh.current.rotation.x = Math.cos(clock.elapsedTime / 2);
    otherMesh.current.rotation.y = Math.sin(clock.elapsedTime / 2);
    otherMesh.current.rotation.z = Math.sin(clock.elapsedTime / 2);

    gl.setRenderTarget(null);
  });


  return (
    <>
      <OrbitControls attach="orbitControls" />
      {createPortal(
        <>
          <PerspectiveCamera
            makeDefault
            manual
            ref={otherCamera}
            position={[0, 0, 8]}
          />
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
      <mesh 
        ref={mesh}
        rotation={[Math.PI / 4, Math.PI/4, 0]}
      >
        <boxGeometry args={[2, 2, 2]} />
        <shaderMaterial
          key={uuidv4()}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          wireframe={false}
        />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} dpr={[1, 2]}>
      <ScreenCoordinates />
      <OrbitControls />
    </Canvas>
  );
};


export default Scene;
`;

const ScreenCoordinates = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
  },
};

export default ScreenCoordinates;
