import { Box, useTheme } from '@maximeheckel/design-system';
import Sandpack from '@theme/components/Code/Sandpack';
import useGPUTier from '@theme/hooks/useGPUTier';
import { useInView } from 'react-intersection-observer';

import FlagFiles from './flag';
import WobblyColoredPlaneFiles from './wobblyColoredPlane';
import FragmentFiles from './fragment';
import WobblyPlaneFiles from './wobblyPlane';
import BlobFiles from './blob';
import GradientFiles from './gradient';
import Gradient2Files from './gradient2';
import PlanetFiles from './planet';

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
    background: #20222B;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const SceneCSSLight = `
html {
    background: #F7F7FB;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const R3FShaderSandpack = (props: any) => {
  const { scene } = props;
  const [ref, inView] = useInView();
  const { dark } = useTheme();
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
              code: dark ? SceneCSSDark : SceneCSSLight,
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

export default R3FShaderSandpack;
