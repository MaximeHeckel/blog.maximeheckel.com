import ComputeCode from './opticalFlowCompute';
import MotionSourceCode from './opticalFlowMotionSource';
import PostprocessingCode from './opticalFlowPostprocessing';

const AppCode = `import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { uniform } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { createComputeNodes } from './compute';
import MovingBlob from './motionSource';
import { createOutputNodes } from './postprocessing';
import './scene.css';

extend(THREE);

const DETECTION_SCALE = 0.5;

const makeRenderTarget = (width, height) =>
  new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: true,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
    stencilBuffer: false,
    type: THREE.UnsignedByteType,
  });

const makeStorageTexture = (width, height) => {
  const storage = new THREE.StorageTexture(width, height);
  storage.magFilter = THREE.NearestFilter;
  storage.minFilter = THREE.NearestFilter;

  return storage;
};

const SceneLights = () => {
  const { scene } = useThree();

  useEffect(() => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
    directionalLight.position.set(10, 10, 10);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    scene.add(directionalLight, ambientLight);

    return () => {
      scene.remove(directionalLight, ambientLight);
    };
  }, [scene]);

  return null;
};

const OpticalFlowEffect = () => {
  const { camera, gl, scene, size } = useThree();
  const postProcessingRef = useRef(null);
  const hasPreviousFrameRef = useRef(false);
  const currentBufferIndexRef = useRef(0);
  const { arrowRowCount, effectEnabled } = useControls('Optical Flow', {
    effectEnabled: {
      value: true,
      label: 'Enable effect',
    },
    arrowRowCount: {
      value: 32,
      options: [16, 32, 48, 64],
      label: 'Arrow rows',
    },
  });

  const targetWidth = Math.max(1, Math.floor(size.width * gl.getPixelRatio()));
  const targetHeight = Math.max(
    1,
    Math.floor(size.height * gl.getPixelRatio()),
  );
  const detectionWidth = Math.max(
    1,
    Math.floor(targetWidth * DETECTION_SCALE),
  );
  const detectionHeight = Math.max(
    1,
    Math.floor(targetHeight * DETECTION_SCALE),
  );
  const targetAspect = targetWidth / targetHeight;

  const resources = useMemo(() => {
    const sceneTarget = makeRenderTarget(targetWidth, targetHeight);
    const stateTextureA = makeStorageTexture(detectionWidth, detectionHeight);
    const stateTextureB = makeStorageTexture(detectionWidth, detectionHeight);

    return {
      sceneTarget,
      stateTextures: [stateTextureA, stateTextureB],
    };
  }, [detectionHeight, detectionWidth, targetHeight, targetWidth]);

  const shaderUniforms = useMemo(
    () => ({
      hasPreviousFrame: uniform(false),
      motionThreshold: uniform(0.01),
      trailDecay: uniform(0.94),
    }),
    [],
  );

  const computeNodes = useMemo(
    () =>
      createComputeNodes({
        detectionHeight,
        detectionWidth,
        resources,
        shaderUniforms,
      }),
    [
      detectionHeight,
      detectionWidth,
      resources,
      shaderUniforms,
    ],
  );

  const outputNodes = useMemo(
    () =>
      createOutputNodes({
        arrowRowCount,
        resources,
        targetAspect,
      }),
    [arrowRowCount, resources, targetAspect],
  );

  useEffect(() => {
    const postProcessing = new THREE.PostProcessing(gl);
    postProcessing.outputNode = outputNodes[0];
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [gl, outputNodes]);

  useEffect(() => {
    hasPreviousFrameRef.current = false;
    currentBufferIndexRef.current = 0;
    shaderUniforms.hasPreviousFrame.value = false;

    return () => {
      resources.sceneTarget.dispose();
      resources.stateTextures.forEach((stateTexture) => {
        stateTexture.dispose();
      });
    };
  }, [resources, shaderUniforms]);

  useFrame(() => {
    shaderUniforms.hasPreviousFrame.value = hasPreviousFrameRef.current;

    if (!effectEnabled) {
      hasPreviousFrameRef.current = false;
      currentBufferIndexRef.current = 0;
      shaderUniforms.hasPreviousFrame.value = false;

      gl.setRenderTarget(null);
      gl.clear();
      gl.render(scene, camera);
      return;
    }

    gl.setRenderTarget(resources.sceneTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    const computeIndex = currentBufferIndexRef.current;
    gl.compute(computeNodes[computeIndex]);

    if (postProcessingRef.current) {
      postProcessingRef.current.outputNode = outputNodes[computeIndex];
      gl.clear();
      postProcessingRef.current.render();
    }

    hasPreviousFrameRef.current = true;
    currentBufferIndexRef.current = 1 - currentBufferIndexRef.current;
  }, 1);

  return null;
};

const App = () => (
  <>
    <Canvas
      dpr={[1, 1.5]}
      flat
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer(props);
        renderer.toneMapping = THREE.NoToneMapping;
        await renderer.init();
        return renderer;
      }}
    >
      <Suspense fallback={null}>
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 12]}
          fov={35}
          near={0.1}
          far={100}
        />
        <color attach="background" args={['#f2f2f2']} />
        <SceneLights />
        <MovingBlob />
        <OpticalFlowEffect />
        <OrbitControls />
      </Suspense>
    </Canvas>
    <Leva collapsed={false} />
  </>
);

export default App;
`;

const OpticalFlow = {
  '/App.js': {
    code: AppCode,
  },
  '/compute.js': {
    code: ComputeCode,
  },
  '/motionSource.js': {
    code: MotionSourceCode,
  },
  '/postprocessing.js': {
    code: PostprocessingCode,
    active: true,
  },
};

export default OpticalFlow;
