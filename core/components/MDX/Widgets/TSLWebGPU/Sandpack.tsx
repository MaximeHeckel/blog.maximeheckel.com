import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import attractor from './attractor';
import blob from './blob';
import computeInstance from './computeInstance';
import fallback from './fallback';
import glassblob from './glassblob';
import outline from './outline';
import particleInit from './particleInit';
import postprocessing from './postprocessing';

const SceneCSSDark = `
html {
    background: #20222B;
}

body {
  height: 100%;
  margin: 0;
}

canvas {
  width: 100vw;
  height: 100vh;
}`;

const CausticsSandpack = (props: any) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);

  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene1: fallback,
    scene2: blob,
    scene3: glassblob,
    scene4: computeInstance,
    scene5: particleInit,
    scene6: attractor,
    scene7: postprocessing,
    scene8: outline,
  };

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '9.120.3',
            '@react-three/fiber': '9.2.0',
            react: '19.1.0',
            'react-dom': '19.1.0',
            leva: '0.9.31',
            three: '0.179.0',
            uuid: '11.0.3',
          }}
          files={{
            // @ts-ignore
            ...SCENES[scene],
            '/scene.css': {
              code: SceneCSSDark,
              hidden: true,
            },
            '/sandbox.config.json': {
              code: `{ "infiniteLoopProtection" :  false }`,
              hidden: true,
            },
          }}
        />
      ) : (
        <Box
          css={{
            height: '520px',
            '@media(max-width: 750px)': {
              height: '1060px',
            },
          }}
        />
      )}
    </Box>
  );
};

export default CausticsSandpack;
