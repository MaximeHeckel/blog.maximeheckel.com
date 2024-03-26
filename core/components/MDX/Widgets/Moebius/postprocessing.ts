const MoebiusPass = `import { Pass } from "postprocessing";
import * as THREE from "three";
import { FullScreenQuad } from "three-stdlib";

const moebiusShader = {
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: \`
    varying vec2 vUv;

    void main() {
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \`,
  fragmentShader: \`
    varying vec2 vUv;
    uniform sampler2D tDiffuse;

    void main() {
      vec2 uv = vUv;
      vec4 color = texture2D(tDiffuse, uv);

      gl_FragColor = vec4(color.r + 0.2, color.g, color.b, color.a);
    }
  \`,
}

class MoebiusPass extends Pass {
  constructor(args) {
    super();

    this.material = new THREE.ShaderMaterial(moebiusShader);
    this.fsQuad = new FullScreenQuad(this.material);
  }

  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
}

export default MoebiusPass;
`;

const AppCode = `import { 
  OrbitControls, 
  Effects,
  PerspectiveCamera,
  useFBO,
} from "@react-three/drei";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import MoebiusPass from "./MoebiusPass";

import './scene.css';

extend({ MoebiusPass });

const Moebius = () => {
  const mesh = useRef();
  const ground = useRef();

  const lightPosition = [10, 10, 10];

  return (
    <>
      <directionalLight
        castShadow
        position={lightPosition}
        intensity={4.5}
        color="#fff"
        target={ground.current}
      />
      <mesh castShadow receiveShadow position={[-1, 2, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh castShadow receiveShadow rotation={[ 0, Math.PI / 3, 0]} position={[2, 0.75, 2]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh ref={ground} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10, 100, 100]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <Effects key={uuidv4()}>
        <moebiusPass />
      </Effects>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback="Loading">
        <ambientLight intensity={0.2} color="#FFFFFF" />
        <color attach="background" args={["#1B43BA"]} />
        <Moebius />
        <OrbitControls />
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={65} />
      </Suspense>
    </Canvas>
  );
};


export default Scene;
`;

const PostProcessing = {
  '/App.js': {
    code: AppCode,
  },
  '/MoebiusPass.js': {
    code: MoebiusPass,
    active: true,
  },
};

export default PostProcessing;
