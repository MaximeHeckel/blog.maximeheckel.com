import { Box } from '@maximeheckel/design-system';
import {
  useFBO,
  PerspectiveCamera,
  PerformanceMonitor,
  OrthographicCamera,
} from '@react-three/drei';
import {
  Canvas,
  createPortal,
  extend,
  ThreeElement,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { useReducedMotion } from 'motion/react';
import { Effect } from 'postprocessing';
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { v4 } from 'uuid';

import renderFragmentShader from './gpgpu/fragmentShader.glsl';
import simulationFragmentShader from './gpgpu/simulationFragment.glsl';
import simulationVertexShader from './gpgpu/simulationVertex.glsl';
import renderVertexShader from './gpgpu/vertexShader.glsl';
import HalftoneFragmentShader from './postprocessing/ascii.glsl';
import { wrapEffect } from './utils';

declare module '@react-three/fiber' {
  interface ThreeElements {
    simMaterial: ThreeElement<typeof SimulationMaterial>;
    depthOfFieldMaterial: ThreeElement<typeof DepthOfFieldMaterial>;
  }
}

class CustomHalftoneEffectImpl extends Effect {
  pixelSize: number;

  constructor({ pixelSize = 1.0 }: { pixelSize?: number }) {
    const uniforms = new Map<string, THREE.Uniform<unknown>>([
      ['pixelSize', new THREE.Uniform(pixelSize)],
    ]);

    super('HalftoneEffect', HalftoneFragmentShader, {
      uniforms,
    });

    this.pixelSize = pixelSize;
  }

  update(
    _renderer: THREE.WebGLRenderer,
    _inputBuffer: THREE.WebGLRenderTarget,
    _deltaTime: number
  ) {
    this.uniforms.get('pixelSize')!.value = this.pixelSize;
  }
}

const CustomHalftoneEffect = wrapEffect(CustomHalftoneEffectImpl);

export const HalftoneEffect = () => {
  const effectRef = useRef<CustomHalftoneEffectImpl | null>(null);

  const { pixelSize } = useControls({
    pixelSize: {
      value: 4.0,
      min: 2.0,
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

  return (
    <EffectComposer>
      <CustomHalftoneEffect ref={effectRef} pixelSize={pixelSize} />
    </EffectComposer>
  );
};

const getRandomData = (width: number, height: number) => {
  const len = width * height * 4;
  const data = new Float32Array(len);

  for (let i = 0; i < len; i += 4) {
    const t = (Math.PI * 2 * i) / len;

    const x = Math.cos(t) / (1.0 + Math.sin(t) * Math.sin(t));
    const y = Math.sin(2.0 * t) / 3.0;
    const z = Math.sin(t) * 0.5;

    const randomness = 1.2;
    data[i] = x * 2.5 + (Math.random() - 0.5) * randomness;
    data[i + 1] = y * 2.5 + (Math.random() - 0.5) * randomness;
    data[i + 2] = z * 2.5 + (Math.random() - 0.5) * randomness;
    data[i + 3] = 1.0;
  }
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
      uSize: { value: size },
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
        value: 3.5,
      },
    };

    super({
      uniforms: renderUniforms,
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
}

extend({ SimMaterial: SimulationMaterial, DepthOfFieldMaterial });

const ParticleLemniscate = ({
  shouldStopRenderingLoop = false,
}: {
  shouldStopRenderingLoop?: boolean;
}) => {
  const size = 256;
  const depthOfFieldMaterialRef = useRef<DepthOfFieldMaterial>(null);
  const simulationMaterialDOFRef = useRef<SimulationMaterial>(null);
  const orthoRef = useRef<THREE.OrthographicCamera>(null);

  const { frequency } = useControls({
    frequency: { value: 0.3, min: 0, max: 1, step: 0.01 },
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

  const renderTargetA = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });

  const renderTargetB = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });

  const pingPong = useRef(0);

  const particles = useMemo(() => {
    const length = size * size;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const i3 = i * 3;
      particles[i3 + 0] = (i % size) / size;
      particles[i3 + 1] = i / size / size;
    }
    return particles;
  }, [size]);

  const frameCount = useRef(0);

  const gl = useThree((state) => state.gl);

  useLayoutEffect(() => {
    if (!orthoRef.current) return;

    gl.setRenderTarget(renderTargetA);
    gl.clear();
    gl.render(scene, orthoRef.current);

    gl.setRenderTarget(renderTargetB);
    gl.clear();
    gl.render(scene, orthoRef.current);

    gl.setRenderTarget(null);
  }, [gl, renderTargetA, renderTargetB, scene]);

  useFrame((state) => {
    const { gl, clock } = state;

    if (
      !simulationMaterialDOFRef.current ||
      !depthOfFieldMaterialRef.current ||
      !orthoRef.current
    )
      return;

    const targets = [renderTargetA, renderTargetB];
    const writeTarget = targets[pingPong.current];
    const readTarget = targets[1 - pingPong.current];

    frameCount.current++;

    if (shouldStopRenderingLoop && frameCount.current > 15) {
      depthOfFieldMaterialRef.current.uniforms.positions.value =
        writeTarget.texture;
      return;
    }

    // Set the simulation to read from the previous frame's output
    simulationMaterialDOFRef.current.uniforms.positions.value =
      readTarget.texture;
    simulationMaterialDOFRef.current.uniforms.uTime.value =
      clock.getElapsedTime();
    simulationMaterialDOFRef.current.uniforms.uFrequency.value = frequency;

    gl.setRenderTarget(writeTarget);
    gl.clear();
    gl.render(scene, orthoRef.current);
    gl.setRenderTarget(null);

    depthOfFieldMaterialRef.current.uniforms.positions.value =
      writeTarget.texture;

    pingPong.current = 1 - pingPong.current;
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
                args={[positions, 3]}
              />
              <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
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

      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={75} />
      <group position={[0, 0.5, 0]} rotation={[0, 0, -Math.PI * 0.135]}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particles, 3]}
            />
          </bufferGeometry>
          <depthOfFieldMaterial key={v4()} ref={depthOfFieldMaterialRef} />
        </points>
      </group>
      <HalftoneEffect />
    </>
  );
};

const Background = () => {
  const backgroundRef = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    if (targetRef.current && spotlightRef.current) {
      targetRef.current.position.set(-5, 5, -10);
      spotlightRef.current.target = targetRef.current;
      targetRef.current.updateMatrixWorld();
    }
  }, []);

  return (
    <>
      <spotLight
        ref={spotlightRef}
        position={[35, 30, 20]}
        intensity={15.0}
        color="#FFFFFF"
        angle={0.25}
        penumbra={1.0}
        decay={0.25}
      />
      <object3D ref={targetRef} />
      <group ref={backgroundRef}>
        <mesh rotation={[0, 0, 0]} position={[0, 0, -10]}>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#0F53B7" />
        </mesh>
        <gridHelper
          args={[50, 120]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -4.5]}
        >
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.02} />
        </gridHelper>
      </group>
    </>
  );
};

export const Scene = () => {
  const [DPR, setDPR] = useState(1.0);
  const [showDebug, setShowDebug] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setShowDebug(
      typeof window !== 'undefined' && window.location.search.includes('?debug')
    );
  }, []);

  if (typeof window !== 'undefined' && window.Cypress) {
    return null;
  }

  return (
    <Box
      css={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: 'min(120dvh, 1100px)',
        zIndex: 0,
        maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
      }}
    >
      <Leva hidden={!showDebug} />
      <Canvas id="main-canvas" shadows dpr={DPR}>
        <color attach="background" args={['#090A0E']} />
        <PerformanceMonitor
          onDecline={() => setDPR(0.7)}
          onIncline={() => setDPR(1.0)}
        />
        <Suspense fallback={null}>
          <ParticleLemniscate shouldStopRenderingLoop={!!shouldReduceMotion} />
          <Background />
        </Suspense>
      </Canvas>
    </Box>
  );
};
