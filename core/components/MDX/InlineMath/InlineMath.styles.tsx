import { Box, styled } from '@maximeheckel/design-system';

export const InlineMathRoot = styled(Box, {
  boxSizing: 'border-box',
  display: 'inline-block',
  maxWidth: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
  verticalAlign: 'text-bottom',
  width: 'fit-content',
  WebkitOverflowScrolling: 'touch',

  '& code': {
    fontSize: '1rem',
  },

  '& .katex': {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    whiteSpace: 'normal',
  },

  '& .katex-html > .base': {
    margin: 0,
    padding: 0,
  },

  '& .vbox .mrel': {
    fontFamily: 'KaTeX_Main, "Times New Roman", serif !important',
  },

  variants: {
    block: {
      true: {
        display: 'block',
        width: '100%',
      },
    },
  },
});
