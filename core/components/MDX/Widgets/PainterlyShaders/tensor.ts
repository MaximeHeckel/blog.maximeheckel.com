const FragmentShader = `varying vec2 vUv;
uniform sampler2D inputBuffer;
uniform vec4 resolution;

// Sobel kernels
const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel


vec4 computeStructureTensor(sampler2D inputTexture, vec2 uv) {
    vec3 tx0y0 = texture2D(inputTexture, uv + vec2(-1, -1) / resolution.xy).rgb;
    vec3 tx0y1 = texture2D(inputTexture, uv + vec2(-1,  0) / resolution.xy).rgb;
    vec3 tx0y2 = texture2D(inputTexture, uv + vec2(-1,  1) / resolution.xy).rgb;
    vec3 tx1y0 = texture2D(inputTexture, uv + vec2( 0, -1) / resolution.xy).rgb;
    vec3 tx1y1 = texture2D(inputTexture, uv + vec2( 0,  0) / resolution.xy).rgb;
    vec3 tx1y2 = texture2D(inputTexture, uv + vec2( 0,  1) / resolution.xy).rgb;
    vec3 tx2y0 = texture2D(inputTexture, uv + vec2( 1, -1) / resolution.xy).rgb;
    vec3 tx2y1 = texture2D(inputTexture, uv + vec2( 1,  0) / resolution.xy).rgb;
    vec3 tx2y2 = texture2D(inputTexture, uv + vec2( 1,  1) / resolution.xy).rgb;

    vec3 Sx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
              Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
              Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

    vec3 Sy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
              Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
              Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

    return vec4(dot(Sx, Sx), dot(Sy, Sy), dot(Sx, Sy), 1.0);
}

void main() {
    vec4 tensor = computeStructureTensor(inputBuffer, vUv);
    
    gl_FragColor = tensor;
}`;

const Models = `import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";


export const Plant = () => {
  const { scene } = useGLTF("https://cdn.maximeheckel.com/models/plant-optimized.glb");


  return (
    <group rotation={[0, 0, 0]} position={[0, -3.5, 0]} scale={4}>
      <primitive  object={scene} />
      <directionalLight position={[15, 10, -5.95]} intensity={20.0} />
    </group>
  );
};


export const Spaceship = () => {
  // Original model by Sousinho
  // Their work: https://sketchfab.com/sousinho
  // The original model: https://sketchfab.com/3d-models/rusty-spaceship-orange-18541ebed6ce44a9923f9b8dc30d87f5
  const gltf = useGLTF("https://cdn.maximeheckel.com/models/spaceship-optimized.glb");

  useEffect(() => {
    if (gltf) {
      function alphaFix(material) {
        material.transparent = true;
        material.alphaToCoverage = true;
        material.depthFunc = THREE.LessEqualDepth;
        material.depthTest = true;
        material.depthWrite = true;
      }
      alphaFix(gltf.materials.spaceship_racer);
      alphaFix(gltf.materials.cockpit);
    }
  }, [gltf]);

  return (
    <group rotation={[Math.PI * 0.05, Math.PI * 0.4, 0]}>
      <group
        scale={0.005}
        rotation={[0, -Math.PI * 0.5, 0]}
        position={[1.583, 0, -3.725]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube001_spaceship_racer_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, -64.81, 64.77]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube005_cockpit_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, 0, 0]}
        />
      </group>
      <directionalLight position={[5, 10, 5.95]} intensity={25.0} />
    </group>
  );
};
`;

const PostProcessing = `import { Pass } from "postprocessing";
import * as THREE from "three";
import tensorFragmentShader from "!!raw-loader!./tensorFragmentShader.glsl";

const tensorShader = {
  uniforms: {
    inputBuffer: { value: null },
    resolution: {
      value: new THREE.Vector4(),
    },
  },
  vertexShader: \`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
   

    // Set the final position of the vertex
    gl_Position = projectionMatrix * modelViewPosition;
  }
  \`,
  fragmentShader: tensorFragmentShader,
};

class TensorPass extends Pass {
  constructor(args) {
    super();

    this.material = new THREE.ShaderMaterial(tensorShader);
    this.fullscreenMaterial = this.material;
    this.resolution = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2))
    );
  }

  dispose() {
    this.material.dispose();
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.inputBuffer.value = readBuffer.texture;
    this.material.uniforms.resolution.value = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2))
    );

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(this.scene, this.camera);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      renderer.render(this.scene, this.camera);
    }
  }
}

export { TensorPass };

`;

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
  Effects,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { Plant, Spaceship } from "./Models";
import { TensorPass } from "./PostProcessing";

import './scene.css';

extend({ TensorPass });

const Painting = () => {
  const tensorPassRef = useRef();

  const { enabled, model } = useControls({
    enabled: true,
    model: {
        value: "spaceship",
        options: ["spaceship", "plant"],
    }
  });

  useFrame((state) => {
    const { camera } = state;
    tensorPassRef.current.enabled = enabled;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group scale={0.70}>
        {model === "spaceship" ? <Spaceship /> : <Plant />}
      </group>
      <Effects key={uuidv4()}>
        <tensorPass 
          ref={tensorPassRef}
        />
      </Effects>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas dpr={[1, 2]}>
      <Suspense fallback="Loading">
        <ambientLight intensity={1.25} />
        <color attach="background" args={["#3386E0"]} />
        <Painting />
        <OrbitControls />
        <OrthographicCamera
          makeDefault
          position={[5, 0, 10]}
          zoom={100}
          near={0.01}
          far={500}
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;`;

const Tensor = {
  '/App.js': {
    code: AppCode,
  },
  '/PostProcessing.js': {
    code: PostProcessing,
  },
  '/Models.js': {
    code: Models,
    hidden: true,
  },
  '/tensorFragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Tensor;
