const AppCode = `import { OrbitControls } from '@react-three/drei';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three/webgpu';
import { 
 Fn,
 vec3,
 vec4,
 abs,
 length,
 clamp,
 uv,
 mix,
 pass,
 nodeObject,
} from 'three/tsl';

import './scene.css';

extend(THREE);

class CustomEffectNode extends THREE.TempNode {
  constructor(inputNode) {
    super('vec4');
    this.inputNode = inputNode;
  }

  setup() {
    const inputNode = this.inputNode;

    const effect = Fn(() => {
      const input = inputNode;

      return vec4(input.r.add(0.25), input.g, input.b, 1.0);
    });

    const outputNode = effect();

    return outputNode;
  }
}

const customPass = (node) =>
  nodeObject(
    new CustomEffectNode(node),
  );

const Core = () => {
  const { scene, camera, gl } = useThree();
    
  useEffect(() => {
    const dirLight = new THREE.DirectionalLight(0xffffff, 4.0);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  }, []);

  const { nodes } = useMemo(() => {
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

  const { outputNode } = useMemo(() => {
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');

    const outputNode = scenePassColor;

    return {
      outputNode,
    };
  }, [scene, camera]);

  const postProcessingRef = useRef();

  useEffect(() => {
    const postProcessing = new THREE.PostProcessing(gl);
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    if (postProcessingRef.current) {
      postProcessingRef.current.needsUpdate = true;
      postProcessingRef.current.outputNode = customPass(
        outputNode,
      );
    }

    return () => {
      postProcessingRef.current = null;
    };
  }, [gl, outputNode]);

  useFrame(() => {
    if (postProcessingRef.current) {
      postProcessingRef.current.render();
    }
  }, 1)


  return (
    <>
      <mesh>
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicNodeMaterial
          colorNode={nodes.sphereColorNode}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[, 256]} />
        <meshStandardMaterial color='white' />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
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

const Postprocessing = {
  '/App.js': {
    code: AppCode,
  },
};

export default Postprocessing;
