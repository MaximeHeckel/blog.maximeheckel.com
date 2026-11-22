import { globalCss } from './stitches.config';
import darkTheme from './themes/dark';
import lightTheme from './themes/light';
import { radii } from './tokens/radii';
import { spaces } from './tokens/spaces';
import { fonts, fontSizes, fontWeights } from './tokens/typography';

const global = {
  '*': {
    'box-sizing': 'border-box',
  },
  '*:before': {
    'box-sizing': 'border-box',
  },
  '*:after': {
    'box-sizing': 'border-box',
  },
};

export const globalStyles = globalCss({
  ':root': {
    ...radii,
    ...spaces,
    ...fonts,
    ...fontSizes,
    ...fontWeights,
  },
  ...global,
  ...lightTheme,
  ...darkTheme,
});
