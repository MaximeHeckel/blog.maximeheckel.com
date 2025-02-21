import { OrbitControls, useFBO, PerformanceMonitor } from '@react-three/drei';
import {
  Canvas,
  createPortal,
  extend,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import renderFragmentShader from './doffbo/fragmentShader.glsl';
import simulationFragmentShader from './doffbo/simulationFragment.glsl';
import simulationVertexShader from './doffbo/simulationVertex.glsl';
import renderVertexShader from './doffbo/vertexShader.glsl';

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

// const getRandomData = (width: number, height: number) => {
//   const len = width * height * 4;
//   const data = new Float32Array(len);

//   for (let i = 0; i < data.length; i++) {
//     const stride = i * 4;

//     data[stride] = (Math.random() - 0.5) * 8.0;
//     data[stride + 1] = (Math.random() - 0.5) * 8.0;
//     data[stride + 2] = (Math.random() - 0.5) * 8.0;
//     data[stride + 3] = 1.0;
//   }
//   return data;
// };

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
  const depthOfFieldMaterialRef = useRef();
  const simulationMaterialDOFRef = useRef();

  // const { frequency, speedFactor, fov, blur, focus } = useControls({
  //   frequency: {
  //     min: 0,
  //     max: 1.0,
  //     value: 0.2,
  //     step: 0.001,
  //   },
  //   speedFactor: { value: 50, min: 0.1, max: 100, step: 0.1 },
  //   fov: { value: 60, min: 0, max: 200 },
  //   blur: { value: 30, min: 0, max: 50, step: 0.1 },
  //   focus: { value: 5.0, min: 3, max: 7, step: 0.01 },
  // });

  const { frequency, speedFactor, fov, blur, focus } = {
    frequency: 0.001,
    speedFactor: 50,
    fov: 20,
    blur: 10,
    focus: 5.0,
  };

  const [scene] = useState(() => new THREE.Scene());
  const [camera] = useState(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / 2 ** 53, 1)
  );
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
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);

    gl.setRenderTarget(renderTargetB);
    gl.clear();
    gl.render(scene, camera);

    gl.setRenderTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const { gl, clock } = state;

    const old = renderTarget;
    renderTarget = renderTargetB;
    renderTargetB = old;

    if (!simulationMaterialDOFRef.current) return;
    simulationMaterialDOFRef.current.uniforms.positions.value =
      renderTargetB.texture;
    // simulationMaterialDOFRef.current.uniforms.uFrequency.value = frequency;
    simulationMaterialDOFRef.current.uniforms.uTime.value =
      clock.getElapsedTime();

    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    if (!depthOfFieldMaterialRef.current) return;

    depthOfFieldMaterialRef.current.uniforms.positions.value =
      renderTarget.texture;
    depthOfFieldMaterialRef.current.uniforms.uFov.value = fov;
    depthOfFieldMaterialRef.current.uniforms.uBlur.value = blur;
    depthOfFieldMaterialRef.current.uniforms.uFocus.value = focus;
    depthOfFieldMaterialRef.current.uniforms.pointSize.value = 1.0;
  });

  return (
    <>
      {createPortal(
        <mesh>
          <simMaterial ref={simulationMaterialDOFRef} args={[size]} />
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
        </mesh>,
        scene
      )}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <depthOfFieldMaterial ref={depthOfFieldMaterialRef} />
      </points>
    </>
  );
};

export const Scene = () => {
  const [DPR, setDPR] = useState(0.85);

  return (
    <Canvas id="main-canvas" dpr={DPR}>
      <OrbitControls />
      {/*<ambientLight /> */}
      <PerformanceMonitor
        // onChange={(performance) => {
        //   setDPR(Math.max(0.7, performance.factor));
        // }}
        onDecline={() => setDPR(0.7)}
        onIncline={() => setDPR(1.0)}
      />
      {/* <axesHelper args={[3, 3, 3]} /> */}
      {/* <pointLight position={[10, 10, 10]} /> */}
      <Suspense fallback={null}>
        <DOFFBO />
      </Suspense>
    </Canvas>
  );
};
