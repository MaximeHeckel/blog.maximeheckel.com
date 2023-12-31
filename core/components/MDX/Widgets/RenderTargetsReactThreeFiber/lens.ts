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

const Lens = () => {
  const mesh1 = useRef();
  const mesh2 = useRef();
  const mesh3 = useRef();
  const mesh4 = useRef();
  const lens = useRef();
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
    const { gl, clock, scene, camera, pointer } = state;

    const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 2]);

    lens.current.position.x = THREE.MathUtils.lerp(
      lens.current.position.x,
      (pointer.x * viewport.width) / 2,
      0.1
    );
    lens.current.position.y = THREE.MathUtils.lerp(
      lens.current.position.y,
      (pointer.y * viewport.height) / 2,
      0.1
    );

    const oldMaterialMesh3 = mesh3.current.material;
    const oldMaterialMesh4 = mesh4.current.material;

    mesh1.current.visible = false;
    mesh2.current.visible = true;

    mesh3.current.material = new THREE.MeshBasicMaterial();
    mesh3.current.material.color = new THREE.Color("#000000");
    mesh3.current.material.wireframe = true;

    mesh4.current.material = new THREE.MeshBasicMaterial();
    mesh4.current.material.color = new THREE.Color("#000000");
    mesh4.current.material.wireframe = true;

    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);

    lens.current.material.uniforms.uTexture.value = renderTarget.texture;
    lens.current.material.uniforms.winResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    ).multiplyScalar(Math.min(window.devicePixelRatio, 2));

    mesh1.current.visible = true;
    mesh2.current.visible = false;

    mesh3.current.material = oldMaterialMesh3;
    mesh3.current.material.wireframe = false;

    mesh4.current.material = oldMaterialMesh4;
    mesh4.current.material.wireframe = false;

    mesh1.current.rotation.x = Math.cos(clock.elapsedTime / 2);
    mesh1.current.rotation.y = Math.sin(clock.elapsedTime / 2);
    mesh1.current.rotation.z = Math.sin(clock.elapsedTime / 2);

    mesh2.current.rotation.x = Math.cos(clock.elapsedTime / 2);
    mesh2.current.rotation.y = Math.sin(clock.elapsedTime / 2);
    mesh2.current.rotation.z = Math.sin(clock.elapsedTime / 2);

    gl.setRenderTarget(null);
  });

  return (
    <>
      <Sky sunPosition={[10, 10, 0]} />
      <Environment preset="sunset" />
      <directionalLight args={[10, 10, 0]} intensity={1} />
      <ambientLight intensity={0.5} />
      <ContactShadows
        frames={1}
        scale={10}
        position={[0, -2, 0]}
        blur={4}
        opacity={0.2}
      />
      <mesh ref={lens} scale={0.5} position={[0, 0, 2.5]}>
        <sphereGeometry args={[1, 128]} />
        <shaderMaterial
          key={uuidv4()}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          wireframe={false}
        />
      </mesh>
      <group>
        <mesh ref={mesh2}>
          <torusGeometry args={[1, 0.25, 16, 100]} />
          <meshPhysicalMaterial
            roughness={0}
            clearcoat={1}
            clearcoatRoughness={0}
            color="#73B9ED"
          />
        </mesh>
        <mesh ref={mesh1}>
          <dodecahedronGeometry args={[1]} />
          <meshPhysicalMaterial
            roughness={0}
            clearcoat={1}
            clearcoatRoughness={0}
            color="#73B9ED"
          />
        </mesh>
        <mesh ref={mesh3} position={[-3, 1, -2]}>
          <icosahedronGeometry args={[1, 8, 8]} />
          <meshPhysicalMaterial
            roughness={0}
            clearcoat={1}
            clearcoatRoughness={0}
            color="#73B9ED"
          />
        </mesh>
        <mesh ref={mesh4} position={[3, -1, -2]}>
          <icosahedronGeometry args={[1, 8, 8]} />
          <meshPhysicalMaterial
            roughness={0}
            clearcoat={1}
            clearcoatRoughness={0}
            color="#73B9ED"
          />
        </mesh>
      </group>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
      <Lens />
    </Canvas>
  );
};


export default Scene;
`;

const Lens = {
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

export default Lens;
