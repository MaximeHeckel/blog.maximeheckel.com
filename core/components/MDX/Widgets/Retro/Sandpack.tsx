import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import blueNoise from './blueNoise';
import color from './color';
import curve from './curve';
import effect from './effect';
import final from './final';
import grayscale from './grayscale';
import hue from './hue';
import ordered from './ordered';
import palette from './palette';
import pixel from './pixel';
import rgb from './rgb';
import waves from './waves';

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
    scene1: effect,
    scene2: ordered,
    scene3: blueNoise,
    scene4: grayscale,
    scene5: color,
    scene6: palette,
    scene7: hue,
    scene8: pixel,
    scene9: waves,
    scene10: rgb,
    scene11: curve,
    scene12: final,
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
            height: '620px',
          }}
        />
      )}
    </Box>
  );
};

export default CausticsSandpack;
