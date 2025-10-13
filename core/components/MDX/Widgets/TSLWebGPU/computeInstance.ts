const AppCode = `import { OrbitControls } from '@react-three/drei';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three/webgpu';
import { 
  float,
  vec3,
  clamp,
  abs,
  mix,
  uv,
  length,
  Fn,
  positionLocal,
  uniform,
  instancedArray,
  instanceIndex,
  wgslFn,
  varying,
} from 'three/tsl';
import { v4 as uuidv4 } from 'uuid';

import './scene.css';


extend(THREE);

const COUNT = 1024;

const Core = () => {
  const meshRef = useRef();
  const { scene, gl } = useThree();

  const lightPosition: [number, number, number] = [10, 10, 10];

  useEffect(() => {
    const dirLight = new THREE.DirectionalLight(0xffffff, 5.0);
    dirLight.position.set(lightPosition[0], lightPosition[1], lightPosition[2]);
    scene.add(dirLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);
  }, []);

  const { nodes: backgroundNodes } = useMemo(() => {
    const gradientNode = Fn(() => {
      const color1 = vec3(0.01, 0.22, 0.98);
      const color2 = vec3(0.36, 0.68, 1.0);
      const t = clamp(length(abs(uv().sub(0.5))), 0.0, 0.8);
      return mix(color1, color2, t);
    });

    const sphereColorNode = gradientNode();

    return {
      nodes: {
        sphereColorNode,
      },
    };
  }, []);

  const { nodes, uniforms, utils} = useMemo(() => {
    const time = uniform(0.0);
    const vHeight = varying(0.0);

    const buffer = instancedArray(COUNT, 'vec3');

    const computeInstancePosition = wgslFn(\`
      fn compute(
        buffer: ptr<storage, array<vec3f>, read_write>,
				count: f32,
				index: u32,
      ) -> void {
        let gridSize = u32(count);
        let gridWidth = u32(sqrt(count));
        let gridHeight = (gridSize + gridWidth - 1u) / gridWidth;
        
        if (index >= gridSize) {
          return;
        }

        let x = index % gridWidth;
        let z = index / gridWidth;
        
        let spacing = 0.6;
        let worldX = f32(x) * spacing - f32(gridWidth - 1u) * spacing * 0.5;
        let worldZ = f32(z) * spacing - f32(gridHeight - 1u) * spacing * 0.5;
        
        buffer[index] = vec3f(worldX, 0.0, worldZ);
      }
    \`);

    const computeNode = computeInstancePosition({
      buffer: buffer,
      count: COUNT,
      index: instanceIndex,
    }).compute(COUNT)

    const updatePosition = wgslFn(\`
      fn update(
        position: vec3f,
        time: f32,
        vHeight: ptr<private, f32>,
      ) -> vec3f {
        let waveSpeed = 5.0;
        let waveAmplitude = 0.5;
        let waveFrequencyX = 0.75;
        let waveFrequencyZ = 0.75;
        
        let waveOffset = sin(position.x * waveFrequencyX + position.z * waveFrequencyZ - time * waveSpeed) * waveAmplitude;
        let waveOffset2 = sin(-position.x * waveFrequencyX + position.z * waveFrequencyZ - time * waveSpeed) * waveAmplitude;
        let newY = position.y + (waveOffset + waveOffset2) / 2.0;
        *vHeight = newY;
        return vec3f(position.x, newY, position.z);
      }
    \`);

    const positionNode = updatePosition({
      position: positionLocal.add(buffer.element(instanceIndex)),
      time: time,
      vHeight: vHeight,
    });

    const heightColor = wgslFn(\`
      fn color(
        vHeight: f32,
      ) -> vec3f {
        let adjustedHeight = max(vHeight, 0.05);
        return vec3f(adjustedHeight, 1.0, 1.0);
      }
    \`);

    const colorNode = heightColor({
      vHeight: vHeight,
    });


    return {
      nodes: {
        positionNode,
        computeNode,
        colorNode,
      },
      uniforms: {
        time,
      },
      utils: {}
    }
  }, []);

  const compute = useCallback(async () => {
    try {
      await gl.computeAsync(nodes.computeNode);
    } catch (error) {
      console.error(error);
    }
  }, [nodes.computeNode, gl]);

  useEffect(() => {
    if (!meshRef.current) return;
    compute();
  }, [compute]);

  useFrame((state) => {
    const { clock } = state;
    
    uniforms.time.value = clock.getElapsedTime();
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicNodeMaterial
          colorNode={backgroundNodes.sphereColorNode}
          side={THREE.BackSide}
        />
      </mesh>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, COUNT]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[0.3, 16]} />
        <meshPhongMaterial
          key={uuidv4()}
          colorNode={nodes.colorNode}
          emissive={new THREE.Color('white').multiplyScalar(0.15)}
          shininess={400.0}
          positionNode={nodes.positionNode}
        />
      </instancedMesh>
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [7, 3, 7] }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props);
          await renderer.init();
          return renderer;
        }}
      >
        <Suspense>
          <OrbitControls />
          <Core />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;`;

const ComputeInstance = {
  '/App.js': {
    code: AppCode,
  },
};

export default ComputeInstance;
