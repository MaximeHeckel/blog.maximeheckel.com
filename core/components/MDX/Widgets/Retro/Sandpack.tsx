import { Box, useTheme } from '@maximeheckel/design-system';
import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';
import { useInView } from 'react-intersection-observer';
import effect from './effect';
import ordered from './ordered';
import blueNoise from './blueNoise';
import grayscale from './grayscale';
import color from './color';
import palette from './palette';
import hue from './hue';
import pixel from './pixel';
import waves from './waves';
import rgb from './rgb';
import curve from './curve';
import final from './final';

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
  const [ref, inView] = useInView();
  const { dark } = useTheme();
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
