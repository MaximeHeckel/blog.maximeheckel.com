import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import screenSpace from './screenSpace';
import temporalAccumulation from './temporalAccumulation';

const SceneCSSDark = `
html {
    background: black;
}

body {
  height: 100%;
  margin: 0;
  background: #080b12;
  color: white;
}

[role="status"] {
  padding: 24px;
}

canvas {
  width: 100vw;
  height: 100vh;
}`;

interface GlobalIlluminationSandpackProps {
  scene: 'scene1' | 'scene2';
}

const GlobalIlluminationSandpack = (props: GlobalIlluminationSandpackProps) => {
  const { scene } = props;

  const ref = useRef(null);
  const inView = useInView(ref);

  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const scenes = { scene1: screenSpace, scene2: temporalAccumulation };

  return (
    <Box ref={ref}>
      {inView && !tierLoading ? (
        <Sandpack
          autorun={autorun}
          template="react"
          dependencies={{
            '@react-three/drei': '10.7.7',
            '@react-three/fiber': '9.4.2',
            react: '19.2.1',
            'react-dom': '19.2.1',
            leva: '0.10.1',
            three: '0.182.0',
          }}
          files={{
            ...scenes[scene],
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

export default GlobalIlluminationSandpack;
