import { Slider } from '@base-ui/react/slider';
import { styled } from 'styled-system/jsx';

import { sliderRootRecipe } from '../Slider/SliderRoot.recipe';

export const PilotSliderRoot = styled(Slider.Root<number>, sliderRootRecipe);
