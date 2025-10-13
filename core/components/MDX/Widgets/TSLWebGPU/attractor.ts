const AppCode = `import { OrbitControls } from '@react-three/drei';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three/webgpu';
import { 
  vec3,
  mix,
  uv,
  Fn,
  uniform,
  instancedArray,
  instanceIndex,
  wgslFn,
  code,
} from 'three/tsl';
import { v4 as uuidv4 } from 'uuid';

import './scene.css';

extend(THREE);

const COUNT = 30000;

const Core = () => {
  const { gl } = useThree();

  const { nodes, uniforms, utils} = useMemo(() => {

    const spawnPositionsBuffer = instancedArray(COUNT, 'vec3');
    const offsetPositionsBuffer = instancedArray(COUNT, 'vec3');

    const spawnPosition = spawnPositionsBuffer.element(instanceIndex);
    const offsetPosition = offsetPositionsBuffer.element(instanceIndex);

    const hash = code(\`
      fn hash(index: u32) -> f32 {
        return fract(sin(f32(index) * 12.9898) * 43758.5453);
      }
    \`);

    const thomasAttractor = wgslFn(\`
      fn thomasAttractor(pos: vec3<f32>) -> vec3<f32> {
        let b = 0.19;

        let dt = 0.015;

        let x = pos.x;
        let y = pos.y;
        let z = pos.z;

        let dx = (-b * x + sin(y)) * dt;
        let dy = (-b * y + sin(z)) * dt;
        let dz = (-b * z + sin(x)) * dt;

        return vec3(dx, dy, dz);
      }
      \`,
    );

    const computeInitWgsl = wgslFn(\`
      fn computeInit(
        spawnPositions: ptr<storage, array<vec3f>, read_write>,
        offsetPositions: ptr<storage, array<vec3f>, read_write>,
        index: u32
      ) -> void {
        let h0 = hash(index);
        let h1 = hash(index + 1u);
        let h2 = hash(index + 2u);
        
        let distance = sqrt(h0 * 4.0);
        let theta = h1 * 6.28318530718; // 2 * PI
        let phi = h2 * 3.14159265359; // PI
        
        let x = distance * sin(phi) * cos(theta);
        let y = distance * sin(phi) * sin(theta);
        let z = distance * cos(phi);
        
        spawnPositions[index] = vec3f(x, y, z);
        offsetPositions[index] = vec3f(0.0);
      }
    \`,
      [hash],
    );

    const computeNode = computeInitWgsl({
      spawnPositions: spawnPositionsBuffer,
      offsetPositions: offsetPositionsBuffer,
      index: instanceIndex,
    }).compute(COUNT);

    const computeNodeUpdate = Fn(() => {
      const updatedOffsetPosition = thomasAttractor({
        pos: spawnPosition.add(offsetPosition),
      });
      offsetPosition.addAssign(updatedOffsetPosition);
    })().compute(COUNT); 

    const scaleNode = wgslFn(\`
      fn scaleNode() -> f32 {
        return randValue(0.01, 0.04, 3u);
      }
    
      fn randValue(min: f32, max: f32, seed: u32) -> f32 {
        return hash(seed) * (max - min) + min;
      }
    \`,
      [hash],
    )();

    const positionNode = Fn(() => {
      const pos = spawnPosition.add(offsetPosition);
      return pos;
    })();

    const particleColor = wgslFn(\`
      fn colorNode(
        spawnPos: vec3f,
        offsetPos: vec3f,
        uvCoord: vec2f
      ) -> vec4f {
        let color = vec3f(0.24, 0.43, 0.96);
        let distanceToCenter = min(
          distance(spawnPos + offsetPos, vec3f(0.0, 0.0, 0.0)),
          2.75
        );
        
        let strength = distance(uvCoord, vec2f(0.5));
        
        let distColor = mix(
          vec3f(0.97, 0.7, 0.45),
          color,
          distanceToCenter * 0.4
        );
        
        let fillMask = 1.0 - strength * 2.0;
        let finalColor = mix(vec3f(0.0), distColor, fillMask);
        
        let circle = smoothstep(0.5, 0.49, strength);
        return vec4f(finalColor * circle, 1.0);
      }
    \`);

    const colorNode = particleColor({
      spawnPos: spawnPosition,
      offsetPos: offsetPosition,
      uvCoord: uv(),
    });


    return {
      nodes: {
        positionNode,
        computeNode,
        computeNodeUpdate,
        colorNode,
        scaleNode,
      },
      uniforms: {},
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
    compute();
  }, [compute]);

  useFrame((state) => {
    const { gl } = state;
    gl.compute(nodes.computeNodeUpdate);
  });

  return (
    <>
      <sprite count={COUNT}>
        <spriteNodeMaterial
          key={uuidv4()}
          colorNode={nodes.colorNode}
          positionNode={nodes.positionNode}
          scaleNode={nodes.scaleNode}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [-4.0, 3.0, 4.0] }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props);
          await renderer.init();
          return renderer;
        }}
      >
        <Suspense>
          <color attach="background" args={['#000000']} />
          <OrbitControls />
          <Core />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;`;

const Attractor = {
  '/App.js': {
    code: AppCode,
  },
};

export default Attractor;
