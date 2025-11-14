import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import BlobFiles from './blob';
import FlagFiles from './flag';
import FragmentFiles from './fragment';
import GradientFiles from './gradient';
import Gradient2Files from './gradient2';
import PlanetFiles from './planet';
import WobblyColoredPlaneFiles from './wobblyColoredPlane';
import WobblyPlaneFiles from './wobblyPlane';

const SCENES = {
  scene1: FlagFiles,
  scene2: FragmentFiles,
  scene3: WobblyPlaneFiles,
  scene4: GradientFiles,
  scene5: WobblyColoredPlaneFiles,
  scene6: BlobFiles,
  scene7: Gradient2Files,
  scene8: PlanetFiles,
};

const SceneCSSDark = `
html {
    background: black;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const R3FShaderSandpack = (props: any) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);

  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '9.11.3',
            '@react-three/fiber': '8.0.20',
            lamina: '1.1.20',
            three: '0.142.0',
          }}
          files={{
            // @ts-ignore
            ...SCENES[scene],
            '/scene.css': {
              code: SceneCSSDark,
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

export default R3FShaderSandpack;
