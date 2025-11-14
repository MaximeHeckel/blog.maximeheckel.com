import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import basic from './basic';
import circular from './circular';
import final from './final';
import material from './material';
import multi from './multi';
import tensor from './tensor';
import weights from './weights';

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

const CausticsSandpack = (props: any) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);
  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene0: material,
    scene1: basic,
    scene2: circular,
    scene3: weights,
    scene4: tensor,
    scene5: multi,
    scene6: final,
  };

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '9.102.2',
            '@react-three/fiber': '8.15.11',
            '@react-three/postprocessing': '^2.16.0',
            leva: '0.9.31',
            postprocessing: '6.34.3',
            three: '0.159.0',
            uuid: '^9.0.0',
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
