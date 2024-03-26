import { Box, useTheme } from '@maximeheckel/design-system';
import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';
import { useInView } from 'react-intersection-observer';
import postprocessing from './postprocessing';
import depth from './depth';
import normal from './normal';
import sobelDepth from './sobelDepth';
import sobel from './sobel';
import handdrawn from './handdrawn';
import tonal from './tonal';
import shadows from './shadows';
import light from './light';
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
    scene1: postprocessing,
    scene2: depth,
    scene3: normal,
    scene4: sobelDepth,
    scene5: sobel,
    scene6: handdrawn,
    scene7: tonal,
    scene8: shadows,
    scene9: light,
    scene10: final,
  };

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '9.70.4',
            '@react-three/fiber': '8.11.2',
            leva: '0.9.31',
            postprocessing: '^6.34.3',
            three: '0.149.0',
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
