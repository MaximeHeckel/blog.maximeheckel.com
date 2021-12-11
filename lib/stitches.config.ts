import { createStitches, CSS as StitchesCSS } from '@stitches/react';

const { config, css, getCssText, styled, keyframes } = createStitches();

export type CSS = StitchesCSS<typeof config>;
export type { VariantProps } from '@stitches/react';
export { config, css, getCssText, keyframes, styled };
