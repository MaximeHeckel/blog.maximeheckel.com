import { Box, useTheme } from '@maximeheckel/design-system';
import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';
import { useInView } from 'react-intersection-observer';
import BasicRenderTarget from './basic';
import InfinityMirror from './infinityMirror';
import Lens from './lens';
import Monopo from './monopo';
import Portal from './portal';
import Postprocessing from './postprocessing';
import ScreenCoordinates from './screenCoordinates';
import TransformPortal from './transformPortal';
import Transition from './transition';

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

const RenderTargetsSandpack = (props: any) => {
  const { scene } = props;
  const [ref, inView] = useInView();
  const { dark } = useTheme();
  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene1: BasicRenderTarget,
    scene2: InfinityMirror,
    scene3: Portal,
    scene4: ScreenCoordinates,
    scene5: Lens,
    scene6: Monopo,
    scene7: TransformPortal,
    scene8: Postprocessing,
    scene9: Transition,
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

export default RenderTargetsSandpack;
