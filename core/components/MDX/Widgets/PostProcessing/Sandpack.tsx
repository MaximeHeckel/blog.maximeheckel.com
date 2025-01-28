import { Box, useTheme } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import ascii from './ascii';
import crochet from './crochet';
import depixelation from './depixelation';
import dots from './dots';
import flow from './flow';
import flutedGlass from './fluted-glass';
import led from './led';
import lego from './lego';
import mouseTrail from './mouse-trail';
import provencher1 from './provencher-1';
import provencher2 from './provencher-2';
import receipt from './receipt';

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

const SceneCSSLight = `
html {
  background: #F7F7FB;
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
  const { dark } = useTheme();
  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene1: receipt,
    scene2: dots,
    scene3: ascii,
    scene4: provencher1,
    scene5: provencher2,
    scene6: led,
    scene7: crochet,
    scene8: lego,
    scene9: flutedGlass,
    scene10: depixelation,
    scene11: mouseTrail,
    scene12: flow,
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
              code: !dark ? SceneCSSLight : SceneCSSDark,
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
