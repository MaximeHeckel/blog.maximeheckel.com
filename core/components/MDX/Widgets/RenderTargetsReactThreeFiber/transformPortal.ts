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
} from "@react-three/drei";
import { Canvas, useFrame, createPortal } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const TransformPortal = () => {
  const torus = useRef();
  const box = useRef();
  const cylinder1 = useRef();
  const cylinder2 = useRef();

  const renderTarget1 = useFBO();
  const renderTarget2 = useFBO();

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
    const { gl, scene, camera, clock } = state;

    cylinder1.current.material.forEach((material) => {
      if (material.type === "ShaderMaterial") {
        material.uniforms.winResolution.value = new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2));
      }
    });

    cylinder2.current.material.forEach((material) => {
      if (material.type === "ShaderMaterial") {
        material.uniforms.winResolution.value = new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2));
      }
    });

    torus.current.visible = false;
    box.current.visible = true;
    gl.setRenderTarget(renderTarget1);
    gl.render(scene, camera);

    torus.current.visible = true;
    box.current.visible = false;
    gl.setRenderTarget(renderTarget2);
    gl.render(scene, camera);

    gl.setRenderTarget(null);

    const newPosZ = Math.sin(clock.elapsedTime) * 3.5;
    box.current.position.z = newPosZ;
    torus.current.position.z = newPosZ;

    box.current.rotation.x = Math.cos(clock.elapsedTime / 2);
    box.current.rotation.y = Math.sin(clock.elapsedTime / 2);
    box.current.rotation.z = Math.sin(clock.elapsedTime / 2);

    torus.current.rotation.x = Math.cos(clock.elapsedTime / 2);
    torus.current.rotation.y = Math.sin(clock.elapsedTime / 2);
    torus.current.rotation.z = Math.sin(clock.elapsedTime / 2);
  });

  return (
    <>
      <Sky sunPosition={[10, 10, 0]} />
      <Environment preset="dawn" />
      <directionalLight args={[10, 10, 0]} intensity={1} />
      <ambientLight intensity={0.5} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={3} />
      <mesh
        ref={cylinder1}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -4]}
      >
        <cylinderGeometry args={[3, 3, 8, 32]} />
        <shaderMaterial
          key={uuidv4()}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            ...uniforms,
            uTexture: {
              value: renderTarget1.texture,
            },
          }}
          attach="material-0"
        />
        <shaderMaterial
          key={uuidv4()}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            ...uniforms,
            uTexture: {
              value: renderTarget1.texture,
            },
          }}
          attach="material-1"
        />
        <meshStandardMaterial
          attach="material-2"
          color="green"
          transparent
          opacity={0}
        />
      </mesh>
      <mesh
        ref={cylinder2}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 4]}
      >
        <cylinderGeometry args={[3, 3, 8, 32]} />
        <shaderMaterial
          key={uuidv4()}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            ...uniforms,
            uTexture: {
              value: renderTarget2.texture,
            },
          }}
          attach="material-0"
        />
        <meshStandardMaterial
          attach="material-1"
          color="green"
          transparent
          opacity={0}
        />
        <shaderMaterial
          key={uuidv4()}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            ...uniforms,
            uTexture: {
              value: renderTarget2.texture,
            },
          }}
          attach="material-2"
        />
      </mesh>
      <mesh>
        <torusGeometry args={[3, 0.2, 16, 100]} />
        <meshStandardMaterial color="#F9F9F9" />
      </mesh>
      <mesh ref={torus} position={[0, 0, 0]}>
        <torusKnotGeometry args={[0.75, 0.3, 100, 16]} />
        <meshPhysicalMaterial
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#73B9ED"
        />
      </mesh>
      <mesh ref={box} position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#73B9ED"
        />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 9] }} dpr={[1, 2]}>
      <TransformPortal />
    </Canvas>
  );
};


export default Scene;
`;

const TransformPortal = {
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

export default TransformPortal;
