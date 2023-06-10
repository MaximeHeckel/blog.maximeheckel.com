import { Box, useTheme } from '@maximeheckel/design-system';
import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';
import { useInView } from 'react-intersection-observer';
import Twist from './twist';
import Basic from './basic';
import CustomGeometry from './customGeometry';
import AnimateAttributes from './animateAttributes';
import AnimateShader from './animateShader';
import CustomizeSizeShader from './customizeSizeShader';
import CustomizePointShader from './customPointShader';
import CurlFBO from './curlFBO';
import MorphFBO from './morphFBO';

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

const ParticlesShaderSandpack = (props: any) => {
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

export default ParticlesShaderSandpack;
