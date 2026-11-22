import { styled } from 'styled-system/jsx';

import Box from '@core/components/Box';

const FootnoteRef = styled(Box, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    textDecoration: 'none',
    flexShrink: 0,
    background: 'var(--gray-500)',
    borderRadius: 'var(--border-radius-0)',
    fontFamily: 'var(--font-mono)',
    fontVariantNumeric: 'tabular-nums',
    border: '1px solid transparent',
    color: 'var(--text-tertiary)',
    width: 'var(--fit-content)',
    padding: '1px',
    minWidth: '12px',
    height: '14px',

    '& a': {
      textDecoration: 'none',
      color: 'inherit',
      outline: 'none',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    '&:focus-within': {
      border: '1px solid var(--hyperlink)',
      color: 'var(--hyperlink)',
    },

    '&:hover': {
      border: '1px solid var(--hyperlink)',
      color: 'var(--hyperlink)',
    },
  },
});

export { FootnoteRef };
