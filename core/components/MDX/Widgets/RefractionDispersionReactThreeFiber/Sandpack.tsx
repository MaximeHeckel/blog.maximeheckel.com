import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import AdvancedSampling from './advancedSampling';
import Final from './final';
import Fresnel from './fresnel';
import Saturation from './saturation';
import SimpleDispersion from './simpleDispersion';
import SimpleRefraction from './simpleRefraction';
import SimpleSampling from './simpleSampling';
import Specular from './specular';
import Transparency from './transparency';

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

const RefractionDispersionSandpack = (props: { scene: string }) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);

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

export default RefractionDispersionSandpack;
