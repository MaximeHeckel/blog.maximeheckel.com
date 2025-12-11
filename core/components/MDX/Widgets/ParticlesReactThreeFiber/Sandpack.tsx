import { Box } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import { useRef } from 'react';

import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';

import AnimateAttributes from './animateAttributes';
import AnimateShader from './animateShader';
import Basic from './basic';
import CurlFBO from './curlFBO';
import CustomGeometry from './customGeometry';
import CustomizePointShader from './customPointShader';
import CustomizeSizeShader from './customizeSizeShader';
import MorphFBO from './morphFBO';
import Twist from './twist';

const SCENES = {
  scene1: Twist,
  scene2: Basic,
  scene3: CustomGeometry,
  scene4: AnimateAttributes,
  scene5: AnimateShader,
  scene6: CustomizeSizeShader,
  scene7: CustomizePointShader,
  scene8: CurlFBO,
  scene9: MorphFBO,
};

const SceneCSSDark = `
html {
    background: black;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const ParticlesShaderSandpack = (props: { scene: string }) => {
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

export default ParticlesShaderSandpack;
