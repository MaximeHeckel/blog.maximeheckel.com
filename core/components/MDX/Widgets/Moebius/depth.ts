const MoebiusVertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MoebiusFragmentShader = `#include <packing>
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;

float readDepth( sampler2D depthTexture, vec2 coord ) {
  float fragCoordZ = texture2D( depthTexture, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

void main() {
  vec2 uv = vUv;

  float depth = readDepth( tDepth, vUv );


  gl_FragColor = vec4(vec3(depth), 1.0);
}
`;

const MoebiusPass = `import { Pass } from "postprocessing";
import * as THREE from "three";
import { FullScreenQuad } from "three-stdlib";

import vertexShader from "!!raw-loader!./MoebiusVertexShader.glsl";
import fragmentShader from "!!raw-loader!./MoebiusFragmentShader.glsl";

const moebiusShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    cameraNear: { value: null },
    cameraFar: { value: null },
  },
  vertexShader,
  fragmentShader,
}

class MoebiusPass extends Pass {
  constructor(args) {
    super();

    this.material = new THREE.ShaderMaterial(moebiusShader);
    this.fsQuad = new FullScreenQuad(this.material);

    this.depthRenderTarget = args.depthRenderTarget;
    this.camera = args.camera;
  }

  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.tDepth.value = this.depthRenderTarget.depthTexture;
    this.material.uniforms.cameraNear.value = this.camera.near;
    this.material.uniforms.cameraFar.value = this.camera.far;

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
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
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

  const { camera } = useThree();

  const depthTexture = new THREE.DepthTexture(
    window.innerWidth,
    window.innerHeight
  );

  const depthRenderTarget = useFBO(window.innerWidth, window.innerHeight, {
    depthTexture,
    depthBuffer: true,
  });

  useFrame((state) => {
    const { gl, scene, camera } = state;

    gl.setRenderTarget(depthRenderTarget);
    gl.render(scene, camera);

    gl.setRenderTarget(null);
  });

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
      <mesh castShadow receiveShadow position={[0, 2, -150]}>
        <sphereGeometry args={[10, 32, 32]} />
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
        <moebiusPass args={[{
            depthRenderTarget,
            camera
          }]}
        />
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
        <PerspectiveCamera 
          makeDefault 
          position={[1, 2, 10]} 
          near={0.01}
          far={200} 
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;
`;

const Depth = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
  '/MoebiusPass.js': {
    code: MoebiusPass,
  },
  '/MoebiusFragmentShader.glsl': {
    code: MoebiusFragmentShader,
  },
  '/MoebiusVertexShader.glsl': {
    code: MoebiusVertexShader,
  },
};

export default Depth;
