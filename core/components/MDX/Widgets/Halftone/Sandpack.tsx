import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import cmyk from './cmyk';
import gooey from './gooey';
import halftone from './halftone';
import jittered from './jittered';

const SceneCSSDark = `
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

const CausticsSandpack = (props: { scene: string }) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);

  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene1: halftone,
    scene2: cmyk,
    scene3: gooey,
    scene4: jittered,
  };

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '^10.7.7',
            '@react-three/fiber': '9.2.0',
            '@react-three/postprocessing': '^3.0.4',
            maath: '0.10.8',
            postprocessing: '^6.37.4',
            react: '19.1.0',
            'react-dom': '19.1.0',
            leva: '^0.10.1',
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
            height: '620px',
          }}
        />
      )}
    </Box>
  );
};

export default CausticsSandpack;
