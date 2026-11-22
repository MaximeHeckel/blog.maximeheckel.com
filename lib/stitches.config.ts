import { createStitches, CSS as StitchesCSS } from '@stitches/react';

const { config, css, getCssText, globalCss, keyframes, styled, theme } =
  createStitches({
    media: {
      xs: '(min-width: 480px)',
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
    },
  });

export type CSS = StitchesCSS<typeof config>;
export type { VariantProps } from '@stitches/react';

export { Shadows } from './tokens/shadows';
export { config, css, getCssText, globalCss, keyframes, styled, theme };
