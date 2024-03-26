const CustomNormalVertexShader = `varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vec3 transformedNormal = normalMatrix * normal;
  vNormal = normalize(transformedNormal);
}
`;

const CustomNormalFragmentShader = `varying vec3 vNormal;

void main() {
  vec3 color = vec3(vNormal);

  gl_FragColor = vec4(color, 1.0);
}
`;

const CustomNormalMaterial = `import * as THREE from "three";
import vertexShader from "!!raw-loader!./CustomNormalVertexShader.glsl";
import fragmentShader from "!!raw-loader!./CustomNormalFragmentShader.glsl";

const normalShader = {
  uniforms: {},
  vertexShader,
  fragmentShader
}

const CustomNormalMaterial = new THREE.ShaderMaterial(normalShader);

export default CustomNormalMaterial;
`;

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
uniform sampler2D tNormal;
uniform float cameraNear;
uniform float cameraFar;
uniform vec2 resolution;
uniform float frequency;
uniform float amplitude;

const mat3 Sx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );
const mat3 Sy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );

float hash(vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  
  return fract((p3.x + p3.y) * p3.z);
}

float readDepth( sampler2D depthTexture, vec2 coord ) {
  float fragCoordZ = texture2D( depthTexture, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

float luma(vec3 color) {
  const vec3 magic = vec3(0.2125, 0.7154, 0.0721);
  return dot(magic, color);
}

void main() {
  vec2 uv = vUv;
  vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );

  float outlineThickness = 1.5;
  vec4 outlineColor = vec4(0.0, 0.0, 0.0, 1.0);

  
  vec2 displacement = vec2(
    (hash(gl_FragCoord.xy) * sin(gl_FragCoord.y * frequency)) ,
    (hash(gl_FragCoord.xy) * cos(gl_FragCoord.x * frequency))
  ) * amplitude /resolution.xy;

  vec4 pixelColor = texture2D(tDiffuse, vUv);

  float depth00 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(-1, 1));
  float depth01 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(-1, 0));
  float depth02 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(-1, -1));

  float depth10 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(0, -1));
  float depth11 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(0, 0));
  float depth12 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(0, 1));

  float depth20 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(1, -1));
  float depth21 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(1, 0));
  float depth22 = readDepth(tDepth, vUv + displacement + outlineThickness * texel * vec2(1, 1));

  float xSobelValueDepth = 
    Sx[0][0] * depth00 + Sx[1][0] * depth01 + Sx[2][0] * depth02 +
    Sx[0][1] * depth10 + Sx[1][1] * depth11 + Sx[2][1] * depth12 +
    Sx[0][2] * depth20 + Sx[1][2] * depth21 + Sx[2][2] * depth22;

  float ySobelValueDepth = 
    Sy[0][0] * depth00 + Sy[1][0] * depth01 + Sy[2][0] * depth02 +
    Sy[0][1] * depth10 + Sy[1][1] * depth11 + Sy[2][1] * depth12 +
    Sy[0][2] * depth20 + Sy[1][2] * depth21 + Sy[2][2] * depth22;

  float gradientDepth = sqrt(pow(xSobelValueDepth, 2.0) + pow(ySobelValueDepth, 2.0));

  float normal00 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(-1, -1)).rgb);
  float normal01 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(-1, 0)).rgb);
  float normal02 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(-1, 1)).rgb);

  float normal10 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(0, -1)).rgb);
  float normal11 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(0, 0)).rgb);
  float normal12 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(0, 1)).rgb);

  float normal20 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(1, -1)).rgb);
  float normal21 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(1, 0)).rgb);
  float normal22 = luma(texture2D(tNormal, vUv + displacement + outlineThickness * texel * vec2(1, 1)).rgb);

  float xSobelNormal = 
    Sx[0][0] * normal00 + Sx[1][0] * normal10 + Sx[2][0] * normal20 +
		Sx[0][1] * normal01 + Sx[1][1] * normal11 + Sx[2][1] * normal21 +
		Sx[0][2] * normal02 + Sx[1][2] * normal12 + Sx[2][2] * normal22;

  float ySobelNormal = 
    Sy[0][0] * normal00 + Sy[1][0] * normal10 + Sy[2][0] * normal20 +
    Sy[0][1] * normal01 + Sy[1][1] * normal11 + Sy[2][1] * normal21 +
    Sy[0][2] * normal02 + Sy[1][2] * normal12 + Sy[2][2] * normal22;

  float gradientNormal = sqrt(pow(xSobelNormal, 2.0) + pow(ySobelNormal, 2.0));

  float outline = gradientDepth * 25.0 + gradientNormal;

  vec4 color = mix(pixelColor, outlineColor, outline);

  gl_FragColor = color;
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
    tNormal: { value: null },
    cameraNear: { value: null },
    cameraFar: { value: null },
    resolution: {
      value: new THREE.Vector2(),
    },
    frequency: { value: 0.05 },
    amplitude: { value: 2.0 },
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
    this.normalRenderTarget = args.normalRenderTarget;
    this.camera = args.camera;
    this.frequency = args.frequency;
    this.amplitude = args.amplitude;

    this.resolution = new THREE.Vector2(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2)
    );
  }

  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.tDepth.value = this.depthRenderTarget.depthTexture;
    this.material.uniforms.tNormal.value = this.normalRenderTarget.texture;
    this.material.uniforms.cameraNear.value = this.camera.near;
    this.material.uniforms.cameraFar.value = this.camera.far;
    this.material.uniforms.frequency.value = this.frequency;
    this.material.uniforms.amplitude.value = this.amplitude;
    this.material.uniforms.resolution.value = new THREE.Vector2(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2)
    );

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
import { useControls } from "leva";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import MoebiusPass from "./MoebiusPass";
import CustomNormalMaterial from "./CustomNormalMaterial";

import './scene.css';

extend({ MoebiusPass });

const Moebius = () => {
  const mesh = useRef();
  const ground = useRef();

  const lightPosition = [10, 10, 10];
  const { amplitude, frequency } = useControls({
    amplitude: { value: 2, min: 0, max: 5, step: 0.1 },
    frequency: { value: 0.08, min: 0, max: 0.15, step: 0.01 },
  });

  const { camera } = useThree();

  const depthTexture = new THREE.DepthTexture(
    window.innerWidth,
    window.innerHeight
  );

  const depthRenderTarget = useFBO(window.innerWidth, window.innerHeight, {
    depthTexture,
    depthBuffer: true,
  });

  const normalRenderTarget = useFBO();

  useFrame((state) => {
    const { gl, scene, camera } = state;

    gl.setRenderTarget(depthRenderTarget);
    gl.render(scene, camera);

    const originalSceneMaterial = scene.overrideMaterial;

    gl.setRenderTarget(normalRenderTarget);

    scene.matrixWorldNeedsUpdate = true;
    scene.overrideMaterial = CustomNormalMaterial;

    gl.render(scene, camera);

    scene.overrideMaterial = originalSceneMaterial;

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
      <mesh castShadow receiveShadow rotation={[ 0, Math.PI / 3, 0]} position={[2, 1, 2]}>
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
            normalRenderTarget,
            camera,
            amplitude,
            frequency
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
          position={[0, 5, 10]} 
          near={0.01}
          far={200} 
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;
`;

const Handdrawn = {
  '/App.js': {
    code: AppCode,
  },
  '/MoebiusPass.js': {
    code: MoebiusPass,
  },
  '/MoebiusFragmentShader.glsl': {
    code: MoebiusFragmentShader,
    active: true,
  },
  '/MoebiusVertexShader.glsl': {
    code: MoebiusVertexShader,
  },
  '/CustomNormalMaterial.js': {
    code: CustomNormalMaterial,
  },
  '/CustomNormalVertexShader.glsl': {
    code: CustomNormalVertexShader,
  },
  '/CustomNormalFragmentShader.glsl': {
    code: CustomNormalFragmentShader,
  },
};

export default Handdrawn;
