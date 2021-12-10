import { createStitches } from '@stitches/react';

const { css, getCssText, styled, globalCss, keyframes } = createStitches();

const globalStyles = globalCss({
  '@import': ['styles/global.css'],
});

export { css, getCssText, globalStyles, keyframes, styled };
