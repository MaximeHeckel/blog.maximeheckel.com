import type { SandpackFiles } from '@codesandbox/sandpack-react';
import { Box, Button, Text } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import {
  ComponentProps,
  ComponentType,
  useEffect,
  useRef,
  useState,
} from 'react';

import type Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

const SCENE_CSS = `
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

const DEPENDENCIES = {
  '@react-three/drei': '^10.7.7',
  '@react-three/fiber': '9.2.0',
  leva: '^0.10.1',
  react: '19.1.0',
  'react-dom': '19.1.0',
  three: '0.179.0',
};

// Keep each source module behind its own import so approaching one playground
// never downloads the other examples.
const SCENES = {
  asciiMotionMask: () => import('./asciiMotionMaskScene'),
  blobTracking: () => import('./blobTrackingScene'),
  blobTrackingEffects: () => import('./blobTrackingEffectsScene'),
  blobTrackingSegments: () => import('./blobTrackingSegmentsScene'),
  objectSmear: () => import('./objectSmearScene'),
  opticalFlow: () => import('./opticalFlowScene'),
  velocityMap: () => import('./velocityMapScene'),
};

type Scene = keyof typeof SCENES;

interface LoadedPlayground {
  scene: Scene;
  Editor: ComponentType<ComponentProps<typeof Sandpack>>;
  files: SandpackFiles;
}

interface ShadingMotionSandpackProps {
  scene: Scene;
  showCode?: boolean;
}

const ShadingMotionSandpack = (props: ShadingMotionSandpackProps) => {
  const { scene, showCode = true } = props;
  const ref = useRef(null);
  const nearViewport = useInView(ref, { margin: '600px 0px', once: true });
  // Give the preview time to initialize too, then release it outside this band.
  const inView = useInView(ref, { margin: '600px 0px' });
  const [loaded, setLoaded] = useState<LoadedPlayground>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { tier, loading: tierLoading } = useGPUTier();
  const autorun = tier > 2;

  useEffect(() => {
    if (!nearViewport) {
      return;
    }

    let active = true;
    setFailed(false);

    Promise.all([
      import('@core/components/Code/Sandpack'),
      SCENES[scene](),
    ]).then(
      ([editor, source]) => {
        if (active) {
          setLoaded({
            scene,
            Editor: editor.default,
            files: {
              ...source.default,
              '/scene.css': { code: SCENE_CSS, hidden: true },
              '/sandbox.config.json': {
                code: '{ "infiniteLoopProtection": false }',
                hidden: true,
              },
            },
          });
        }
      },
      () => {
        if (active) {
          setFailed(true);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [nearViewport, scene, attempt]);

  const playground = loaded?.scene === scene ? loaded : undefined;

  return (
    <Box ref={ref} role="region" aria-label={`${scene} playground`}>
      {playground && !tierLoading ? (
        <playground.Editor
          key={scene}
          previewActive={inView}
          autorun={autorun}
          showCode={showCode}
          template="react"
          dependencies={DEPENDENCIES}
          files={playground.files}
        />
      ) : (
        <Box css={{ height: '620px' }}>
          {failed ? (
            <>
              <Text role="status">Unable to load the playground.</Text>
              <Button onClick={() => setAttempt((value) => value + 1)}>
                Retry loading playground
              </Button>
            </>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

export default ShadingMotionSandpack;
