import { createStitches, CSS as StitchesCSS } from '@stitches/react';

const {
  config,
  css,
  getCssText,
  styled,
  globalCss,
  keyframes,
} = createStitches();

const globalStyles = globalCss({
  '@import': ['styles/global.css'],
});

export type CSS = StitchesCSS<typeof config>;
export type { VariantProps } from '@stitches/react';
export { config, css, getCssText, globalStyles, keyframes, styled };
