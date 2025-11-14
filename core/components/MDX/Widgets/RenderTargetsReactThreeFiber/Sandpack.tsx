import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

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

const RenderTargetsSandpack = (props: any) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);

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
            '@react-three/drei': '9.102.2',
            '@react-three/fiber': '8.15.11',
            leva: '0.9.31',
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

export default RenderTargetsSandpack;
