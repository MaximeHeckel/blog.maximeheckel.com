import ComputeCode from './blobTrackingCompute';
import PostprocessingCode from './blobTrackingPostprocessing';

const AppCode = `import { useVideoTexture } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { storage, uniform } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { createComputeNodes } from './compute';
import { createOutputNode } from './postprocessing';
import './scene.css';

extend(THREE);

const VIDEO_URL =
  'https://cdn.maximeheckel.com/videos/footages/bloom2.mp4';
const DETECTION_SCALE = 0.5;
const MAX_BLOBS = 9;

const makeStorageTexture = (width, height) => {
  const storage = new THREE.StorageTexture(width, height);
  storage.magFilter = THREE.NearestFilter;
  storage.minFilter = THREE.NearestFilter;

  return storage;
};

const MotionBoxes = () => {
  const videoTexture = useVideoTexture(VIDEO_URL, {
    loop: true,
    muted: true,
  });
  const { gl, size } = useThree();
  const postProcessingRef = useRef(null);
  const hasPreviousFrameRef = useRef(false);
  const currentBufferIndexRef = useRef(0);

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

  const video = videoTexture.source.data;
  const videoAspect = video.videoWidth / video.videoHeight || 16 / 9;
  const targetAspect = targetWidth / targetHeight;
  const videoUvScaleX =
    videoAspect > targetAspect ? targetAspect / videoAspect : 1;
  const videoUvScaleY =
    videoAspect > targetAspect ? 1 : videoAspect / targetAspect;

  const resources = useMemo(() => {
    const stateTextureA = makeStorageTexture(detectionWidth, detectionHeight);
    const stateTextureB = makeStorageTexture(detectionWidth, detectionHeight);
    const blobStateBuffer = storage(
      new THREE.StorageInstancedBufferAttribute(
        new Float32Array(MAX_BLOBS * 4),
        4,
      ),
      'vec4',
      MAX_BLOBS,
    );

    return {
      blobStateBuffer,
      stateTextures: [stateTextureA, stateTextureB],
    };
  }, [detectionHeight, detectionWidth]);

  const shaderUniforms = useMemo(
    () => ({
      hasPreviousFrame: uniform(false),
      motionThreshold: uniform(0.02),
      trailDecay: uniform(0.82),
    }),
    [],
  );

  const { computeBlobNodes, computeMotionNodes } = useMemo(
    () =>
      createComputeNodes({
        detectionHeight,
        detectionWidth,
        maxBlobs: MAX_BLOBS,
        resources,
        shaderUniforms,
        videoTexture,
        videoUvScaleX,
        videoUvScaleY,
      }),
    [
      detectionHeight,
      detectionWidth,
      resources,
      shaderUniforms,
      videoTexture,
      videoUvScaleX,
      videoUvScaleY,
    ],
  );

  const outputNode = useMemo(
    () =>
      createOutputNode({
        maxBlobs: MAX_BLOBS,
        resources,
        targetAspect,
        videoTexture,
        videoUvScaleX,
        videoUvScaleY,
      }),
    [
      resources,
      targetAspect,
      videoTexture,
      videoUvScaleX,
      videoUvScaleY,
    ],
  );

  useEffect(() => {
    const postProcessing = new THREE.PostProcessing(gl);
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [gl, outputNode]);

  useEffect(() => {
    hasPreviousFrameRef.current = false;
    currentBufferIndexRef.current = 0;
    shaderUniforms.hasPreviousFrame.value = false;

    return () => {
      resources.stateTextures.forEach((stateTexture) => {
        stateTexture.dispose();
      });
    };
  }, [resources, shaderUniforms]);

  useFrame(() => {
    const computeIndex = currentBufferIndexRef.current;
    shaderUniforms.hasPreviousFrame.value = hasPreviousFrameRef.current;

    gl.compute(computeMotionNodes[computeIndex]);
    gl.compute(computeBlobNodes[computeIndex]);

    if (postProcessingRef.current) {
      gl.clear();
      postProcessingRef.current.render();
    }

    hasPreviousFrameRef.current = true;
    currentBufferIndexRef.current = 1 - currentBufferIndexRef.current;
  }, 1);

  return null;
};

const App = () => (
  <Canvas
    dpr={[1, 1.5]}
    gl={async (props) => {
      const renderer = new THREE.WebGPURenderer(props);
      await renderer.init();
      return renderer;
    }}
  >
    <Suspense fallback={null}>
      <MotionBoxes />
    </Suspense>
  </Canvas>
);

export default App;
`;

const BlobTracking = {
  '/App.js': {
    code: AppCode,
  },
  '/compute.js': {
    code: ComputeCode,
    active: true,
  },
  '/postprocessing.js': {
    code: PostprocessingCode,
  },
};

export default BlobTracking;
