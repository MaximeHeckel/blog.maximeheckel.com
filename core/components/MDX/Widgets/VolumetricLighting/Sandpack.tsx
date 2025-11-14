import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import arches from './arches';
import cubeCam from './cubeCam';
import depthstop from './depthstop';
import fog from './fog';
import lightray from './lightray';
import multiLight from './multiLight';
import multiple from './multiple';
import performance from './performance';
import scattering from './scattering';
import sdf from './sdf';
import shadows from './shadows';
import solar from './solar';

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
    scene1: lightray,
    scene2: depthstop,
    scene3: sdf,
    scene4: shadows,
    scene5: scattering,
    scene6: fog,
    scene7: performance,
    scene8: multiple,
    scene9: arches,
    scene10: solar,
    scene11: multiLight,
    scene12: cubeCam,
  };

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '9.120.3',
            '@react-three/fiber': '8.17.10',
            '@react-three/postprocessing': '2.16.3',
            leva: '0.9.31',
            maath: '0.10.8',
            postprocessing: '6.36.3',
            three: '0.170.0',
            uuid: '9.0.0',
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
