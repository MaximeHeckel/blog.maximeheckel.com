import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import asciiMotionMask from './asciiMotionMaskScene';
import blobTrackingEffects from './blobTrackingEffectsScene';
import blobTracking from './blobTrackingScene';
import blobTrackingSegments from './blobTrackingSegmentsScene';
import objectSmear from './objectSmearScene';
import opticalFlow from './opticalFlowScene';
import velocityMap from './velocityMapScene';

const SCENE_CSS = `
html {
  background: black;
}

body {
  height: 100%;
  margin: 0;
}

canvas {
  width: 100vw;
  height: 100vh;
}`;

const SCENES = {
  asciiMotionMask,
  blobTracking,
  blobTrackingEffects,
  blobTrackingSegments,
  objectSmear,
  opticalFlow,
  velocityMap,
};

interface ShadingMotionSandpackProps {
  scene: keyof typeof SCENES;
  showCode?: boolean;
}

const ShadingMotionSandpack = (props: ShadingMotionSandpackProps) => {
  const { scene, showCode = true } = props;
  const ref = useRef(null);
  const inView = useInView(ref);
  const { tier, loading: tierLoading } = useGPUTier();
  const autorun = tier > 2;

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          showCode={showCode}
          template="react"
          dependencies={{
            '@react-three/drei': '^10.7.7',
            '@react-three/fiber': '9.2.0',
            leva: '^0.10.1',
            react: '19.1.0',
            'react-dom': '19.1.0',
            three: '0.179.0',
          }}
          files={{
            ...SCENES[scene],
            '/scene.css': {
              code: SCENE_CSS,
              hidden: true,
            },
            '/sandbox.config.json': {
              code: `{ "infiniteLoopProtection" :  false }`,
              hidden: true,
            },
          }}
        />
      ) : (
        <Box css={{ height: '620px' }} />
      )}
    </Box>
  );
};

export default ShadingMotionSandpack;
