import ComputeCode from './asciiMotionMaskCompute';
import PostprocessingCode from './asciiMotionMaskPostprocessing';

const AppCode = `import { useVideoTexture } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { uniform } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { createComputeNodes } from './compute';
import { createOutputNodes } from './postprocessing';
import './scene.css';

extend(THREE);

const VIDEO_URL =
  'https://cdn.maximeheckel.com/videos/footages/clouds.mp4';
const ASCII_CHARACTERS = ' .,:-=+*%#$';
const DETECTION_SCALE = 0.25;

const makeStorageTexture = (width, height) => {
  const storage = new THREE.StorageTexture(width, height);

  storage.magFilter = THREE.NearestFilter;
  storage.minFilter = THREE.NearestFilter;

  return storage;
};

const makeAsciiTexture = () => {
  const characterSize = 256;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = characterSize * ASCII_CHARACTERS.length;
  canvas.height = characterSize;

  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  context.imageSmoothingEnabled = true;
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.font = characterSize +
    'px "Space Grotesk", "MS Gothic", "Noto Sans JP", monospace';
  context.textBaseline = 'middle';
  context.textAlign = 'center';

  ASCII_CHARACTERS.split('').forEach((character, index) => {
    context.fillText(
      character,
      (index + 0.5) * characterSize,
      characterSize / 2,
    );
  });

  const asciiTexture = new THREE.CanvasTexture(canvas);

  asciiTexture.generateMipmaps = false;
  asciiTexture.magFilter = THREE.LinearFilter;
  asciiTexture.minFilter = THREE.LinearFilter;
  asciiTexture.wrapS = THREE.ClampToEdgeWrapping;
  asciiTexture.wrapT = THREE.ClampToEdgeWrapping;
  asciiTexture.needsUpdate = true;

  return asciiTexture;
};

const AsciiMotionMask = () => {
  const videoTexture = useVideoTexture(VIDEO_URL, {
    loop: true,
    muted: true,
  });
  const { gl, size } = useThree();
  const postProcessingRef = useRef(null);
  const hasPreviousFrameRef = useRef(false);
  const currentBufferIndexRef = useRef(0);
  const { motionThreshold, showMotionMask } = useControls(
    'ASCII motion mask',
    {
      showMotionMask: {
        value: false,
        label: 'Show motion mask',
      },
      motionThreshold: {
        value: 0.02,
        min: 0.005,
        max: 0.2,
        step: 0.005,
        label: 'Motion threshold',
      },
    },
  );

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
    const asciiTexture = makeAsciiTexture();

    return {
      asciiTexture,
      stateTextures: [stateTextureA, stateTextureB],
    };
  }, [detectionHeight, detectionWidth]);

  const shaderUniforms = useMemo(
    () => ({
      hasPreviousFrame: uniform(false),
      motionThreshold: uniform(0.1),
      trailDecay: uniform(0.98),
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

  const outputNodes = useMemo(
    () =>
      createOutputNodes({
        resources,
        showMotionMask,
        targetAspect,
        videoTexture,
        videoUvScaleX,
        videoUvScaleY,
      }),
    [
      resources,
      showMotionMask,
      targetAspect,
      videoTexture,
      videoUvScaleX,
      videoUvScaleY,
    ],
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
      resources.asciiTexture.dispose();
      resources.stateTextures.forEach((stateTexture) => {
        stateTexture.dispose();
      });
    };
  }, [resources, shaderUniforms]);

  useFrame(() => {
    const computeIndex = currentBufferIndexRef.current;

    shaderUniforms.hasPreviousFrame.value = hasPreviousFrameRef.current;
    shaderUniforms.motionThreshold.value = motionThreshold;

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
        <AsciiMotionMask />
      </Suspense>
    </Canvas>
    <Leva collapsed={false} />
  </>
);

export default App;
`;

const AsciiMotionMask = {
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

export default AsciiMotionMask;
