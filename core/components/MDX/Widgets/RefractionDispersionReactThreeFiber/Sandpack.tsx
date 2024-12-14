import { Box, useTheme } from '@maximeheckel/design-system';
import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import { useRef } from 'react';
import { useInView } from 'motion/react';

import Transparency from './transparency';
import SimpleRefraction from './simpleRefraction';
import SimpleDispersion from './simpleDispersion';
import SimpleSampling from './simpleSampling';
import Saturation from './saturation';
import AdvancedSampling from './advancedSampling';
import Specular from './specular';
import Fresnel from './fresnel';
import Final from './final';

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

const RefractionDispersionSandpack = (props: any) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);
  const { dark } = useTheme();
  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene1: Transparency,
    scene2: SimpleRefraction,
    scene3: SimpleDispersion,
    scene4: SimpleSampling,
    scene5: Saturation,
    scene6: AdvancedSampling,
    scene7: Specular,
    scene8: Fresnel,
    scene9: Final,
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
            lamina: '1.1.20',
            leva: '0.9.34',
            three: '0.159.0',
            uuid: '^9.0.0',
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

export default RefractionDispersionSandpack;
