import { Box, styled } from '@maximeheckel/design-system';

const FootnoteRef = styled(Box, {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  textDecoration: 'none',
  flexShrink: 0,
  background: 'var(--gray-500)',
  borderRadius: 'var(--border-radius-0)',
  fontVariantNumeric: 'tabular-nums',
  border: '1px solid transparent',
  color: 'var(--text-tertiary)',
  width: 16,
  height: 16,

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
});

export { FootnoteRef };
