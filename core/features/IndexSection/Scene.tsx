import {
  OrbitControls,
  useFBO,
  PerspectiveCamera,
  PerformanceMonitor,
  OrthographicCamera,
  useTexture,
} from '@react-three/drei';
import {
  Canvas,
  createPortal,
  extend,
  Object3DNode,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { v4 } from 'uuid';

import renderFragmentShader from './doffbo/fragmentShader.glsl';
import simulationFragmentShader from './doffbo/simulationFragment.glsl';
import simulationVertexShader from './doffbo/simulationVertex.glsl';
import renderVertexShader from './doffbo/vertexShader.glsl';
import ASCIIfragmentShader from './postprocessing/ascii.glsl';

declare module '@react-three/fiber' {
  interface ThreeElements {
    simMaterial: Object3DNode<SimulationMaterial, typeof SimulationMaterial>;
    depthOfFieldMaterial: Object3DNode<
      DepthOfFieldMaterial,
      typeof DepthOfFieldMaterial
    >;
  }
}

class CustomASCIIEffectImpl extends Effect {
  constructor({ pixelSize = 1.0, asciiTexture, charCount }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
      ['asciiTexture', new THREE.Uniform(asciiTexture)],
      ['charCount', new THREE.Uniform(new THREE.Vector2(charCount, charCount))],
    ]);

    super('CustomASCIIEffect', ASCIIfragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
    this.uniforms.get('asciiTexture').value = this.asciiTexture;
    if (this.charCount) {
      this.uniforms.get('charCount').value = new THREE.Vector2(
        this.charCount[0],
        this.charCount[1]
      );
    }
    // this.uniforms.get('charSize').value = this.charSize;
  }
}

class CustomDitherEffectImpl extends Effect {
  constructor({ bias = 0.85, noise }) {
    const uniforms = new Map([
      ['noise', new THREE.Uniform(noise)],
      ['bias', new THREE.Uniform(bias)],
    ]);

    super('CustomDitherEffect', ASCIIfragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('bias').value = this.bias;
    this.uniforms.get('noise').value = this.noise;
  }
}

const CustomASCIIEffect = wrapEffect(CustomASCIIEffectImpl);
const CustomDitherEffect = wrapEffect(CustomDitherEffectImpl);
const ASCII_CHARS = './ノハメラマ木';

export const ASCIIEffect = () => {
  const effectRef = useRef();

  const { pixelSize } = useControls({
    pixelSize: {
      value: 4.0,
      min: 1.0,
      max: 64.0,
      step: 2.0,
    },
  });

  useFrame((state) => {
    const { camera } = state;

    if (effectRef.current) {
      effectRef.current.pixelSize = pixelSize;
    }

    camera.lookAt(0, 0, 0);
  });

  const fontFamily = '"Space Grotesk", "MS Gothic", "Noto Sans JP", monospace';

  useEffect(() => {
    const CHAR_SIZE = 1.0;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Modified calculation to maintain readable character size
    const BASE_SIZE = 32;
    const adjustedCharSize = Math.max(BASE_SIZE, CHAR_SIZE * BASE_SIZE);
    canvas.width = adjustedCharSize * ASCII_CHARS.length;
    canvas.height = adjustedCharSize;

    // Black background
    ctx.fillStyle = '#090A0E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White characters
    ctx.fillStyle = 'white';
    ctx.font = `${adjustedCharSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Draw each character
    ASCII_CHARS.split('').forEach((char, i) => {
      ctx.fillText(char, (i + 0.5) * adjustedCharSize, adjustedCharSize / 2);
    });

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // Pass texture to shader
    if (effectRef.current) {
      effectRef.current.asciiTexture = texture;
      effectRef.current.charCount = [ASCII_CHARS.length, 1];
      effectRef.current.charSize = CHAR_SIZE;
    }
  }, [pixelSize]);

  return (
    <EffectComposer>
      <CustomASCIIEffect ref={effectRef} pixelSize={pixelSize} />
    </EffectComposer>
  );
};

const DitherEffect = () => {
  const effectRef = useRef();

  const texture = useTexture('https://cdn.maximeheckel.com/noises/bn.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const { bias } = useControls({
    bias: {
      value: 0.85,
      min: 0.0,
      max: 1.0,
    },
  });

  useFrame(() => {
    effectRef.current.noise = texture;
    effectRef.current.bias = bias;
  });

  return (
    <EffectComposer>
      <CustomDitherEffect ref={effectRef} />
    </EffectComposer>
  );
};

const getRandomData = (width: number, height: number) => {
  const len = width * height * 4;
  const data = new Float32Array(len);

  // for (let i = 0; i < len; i += 4) {
  //   // Calculate normalized position (0 to 1)
  //   const t = (Math.PI * 2 * i) / len;

  //   // Create figure-eight base position
  //   const x = Math.cos(t) / (1.0 + Math.sin(t) * Math.sin(t));
  //   const y = Math.sin(2.0 * t) / 3.0;
  //   const z = Math.sin(t) * 0.5;

  //   // Add more random variation to create a thicker cloud effect
  //   const randomness = 1.2; // Increased from 0.5 to create thicker pattern
  //   data[i] = x * 2.5 + (Math.random() - 0.5) * randomness; // Increased base scaling from 2.0 to 2.5
  //   data[i + 1] = y * 2.5 + (Math.random() - 0.5) * randomness;
  //   data[i + 2] = z * 2.5 + (Math.random() - 0.5) * randomness;
  //   data[i + 3] = 1.0;
  // }
  return data;
};

class SimulationMaterial extends THREE.ShaderMaterial {
  constructor(size: number) {
    const positionsTexture = new THREE.DataTexture(
      getRandomData(size, size),
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positionsTexture.needsUpdate = true;

    const simulationUniforms = {
      positions: { value: positionsTexture },
      uFrequency: { value: 0.25 },
      uTime: { value: 0 },
    };

    super({
      uniforms: simulationUniforms,
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
    });
  }
}

class DepthOfFieldMaterial extends THREE.ShaderMaterial {
  constructor() {
    const renderUniforms = {
      positions: {
        value: null,
      },
      pointSize: {
        value: 3.0,
      },
      uFocus: { value: 4.0 },
      uFov: { value: 45 },
      uBlur: { value: 30 },
    };

    super({
      uniforms: renderUniforms,
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
  }
}

extend({ SimMaterial: SimulationMaterial, DepthOfFieldMaterial });

const DOFFBO = () => {
  const size = 256;
  const depthOfFieldMaterialRef = useRef<DepthOfFieldMaterial>(null);
  const simulationMaterialDOFRef = useRef<SimulationMaterial>(null);
  const orthoRef = useRef<THREE.OrthographicCamera>(null);

  const { fov, blur, focus } = useControls({
    fov: { value: 60, min: 0, max: 180 },
    blur: { value: 3.5, min: 0, max: 50, step: 0.1 },
    focus: { value: 5.0, min: 3, max: 7, step: 0.01 },
  });

  const [scene] = useState(() => new THREE.Scene());
  const [positions] = useState(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ])
  );
  const [uvs] = useState(
    () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])
  );

  let renderTarget = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
  });

  let renderTargetB = renderTarget.clone();

  const particles = useMemo(() => {
    const length = size * size;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const i3 = i * 3;
      particles[i3 + 0] = (i % size) / size;
      particles[i3 + 1] = i / size / size;
    }
    return particles;
  }, []);

  const { gl } = useThree();

  useEffect(() => {
    if (!orthoRef.current) return;

    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, orthoRef.current);

    gl.setRenderTarget(renderTargetB);
    gl.clear();
    gl.render(scene, orthoRef.current);

    gl.setRenderTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const { gl, clock } = state;

    const old = renderTarget;
    renderTarget = renderTargetB;
    renderTargetB = old;

    if (
      !simulationMaterialDOFRef.current ||
      !depthOfFieldMaterialRef.current ||
      !orthoRef.current
    )
      return;
    simulationMaterialDOFRef.current.uniforms.positions.value =
      renderTargetB.texture;
    // simulationMaterialDOFRef.current.uniforms.uFrequency.value = frequency;
    simulationMaterialDOFRef.current.uniforms.uTime.value =
      clock.getElapsedTime();

    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, orthoRef.current);
    gl.setRenderTarget(null);

    depthOfFieldMaterialRef.current.uniforms.positions.value =
      renderTarget.texture;
    depthOfFieldMaterialRef.current.uniforms.uFov.value = fov;
    depthOfFieldMaterialRef.current.uniforms.uBlur.value = blur;
    depthOfFieldMaterialRef.current.uniforms.uFocus.value = focus;
    depthOfFieldMaterialRef.current.uniforms.pointSize.value = 2.3;
  });

  return (
    <>
      {createPortal(
        <>
          <mesh>
            <simMaterial
              key={v4()}
              ref={simulationMaterialDOFRef}
              args={[size]}
            />
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={positions.length / 3}
                array={positions}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-uv"
                count={uvs.length / 2}
                array={uvs}
                itemSize={2}
              />
            </bufferGeometry>
          </mesh>
        </>,
        scene
      )}
      {/*
       * OrthographicCamera setup for FBO (Framebuffer Object) rendering:
       * - Viewport is set to perfect square (-1 to 1 in both axes) to match UV space
       * - This creates a 1:1 mapping between clip space and UV coordinates
       * - near/far set to handle floating point precision:
       * - near is set to smallest possible positive float (1/2^53) to avoid near plane clipping
       * - far is set to 1.0 since we're only rendering a 2D plane for FBO calculations
       */}
      <OrthographicCamera
        ref={orthoRef}
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={1 / 2 ** 53}
        far={1}
      />
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={75} />
      <group position={[0, 0, 0]} rotation={[0, 0, -Math.PI * 0.35]}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particles.length / 3}
              array={particles}
              itemSize={3}
            />
          </bufferGeometry>
          <depthOfFieldMaterial key={v4()} ref={depthOfFieldMaterialRef} />
        </points>
      </group>
      <group>
        <mesh rotation={[0, 0, 0]} position={[0, 0, -10]}>
          <planeGeometry args={[300, 300]} />
          <meshBasicMaterial color="#0F53B7" />
        </mesh>
        <gridHelper
          args={[25, 25]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 2, -9.5]}
        >
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.02} />
        </gridHelper>
      </group>
      <ASCIIEffect />
      {/* <DitherEffect /> */}
    </>
  );
};

export const Scene = () => {
  const [DPR, setDPR] = useState(0.85);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setShowDebug(
      typeof window !== 'undefined' && window.location.search.includes('?debug')
    );
  }, []);
  return (
    <>
      <Leva hidden={!showDebug} />
      <Canvas id="main-canvas" dpr={DPR}>
        <color attach="background" args={['#090A0E']} />
        <OrbitControls />
        <PerformanceMonitor
          onDecline={() => setDPR(0.7)}
          onIncline={() => setDPR(1.0)}
        />
        <Suspense fallback={null}>
          <DOFFBO />
        </Suspense>
      </Canvas>
    </>
  );
};
