import { Box } from '@maximeheckel/design-system';
import Sandpack from '@core/components/Code/Sandpack';
import useGPUTier from '@core/hooks/useGPUTier';
import { useInView } from 'react-intersection-observer';
import FirstRaymarchedScene from './firstRaymarchedScene';
import DiffuseLighting from './diffuseLighting';
import CombingingSDF from './combiningSDF';
import IntersectingSDF from './intersectingSDF';
import Smoothmin from './smoothmin';
import Richardmattka from './richardmattka';
import InfinitySpheres from './infinitySpheres';
import MengerFractal from './mengerFractal';
import NoiseDerivatives from './noiseDerivatives';
import MartianLandscape from './martianLandscape';
import VolumetricRaymarching from './volumetric';
import VolumetricRaymarchingWithFBM from './volumetricNoise';
import DirectionalDerivative from './directionalDerivative';
import MorphingCloud from './morphingCloud';
import BlueNoiseDithering from './bluenoiseDithering';
import BicubicFiltering from './bicubicFiltering';
import BeersLaw from './beersLaw';
import LightTransmittance from './lightTransmittance';
import Phase from './phase';

const CSSCode = `
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
  const { tier, loading: tierLoading } = useGPUTier();

  const autorun = tier > 2;

  const SCENES = {
    scene1: FirstRaymarchedScene,
    scene2: DiffuseLighting,
    scene3: CombingingSDF,
    scene4: IntersectingSDF,
    scene5: Smoothmin,
    scene6: Richardmattka,
    scene7: InfinitySpheres,
    scene8: MengerFractal,
    scene9: NoiseDerivatives,
    scene10: MartianLandscape,
    scene11: VolumetricRaymarching,
    scene12: VolumetricRaymarchingWithFBM,
    scene13: DirectionalDerivative,
    scene14: MorphingCloud,
    scene15: BlueNoiseDithering,
    scene16: BicubicFiltering,
    scene17: BeersLaw,
    scene18: LightTransmittance,
    scene19: Phase,
  };

  return (
    <Box css={{ width: '100%' }} ref={ref}>
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
              code: CSSCode,
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
