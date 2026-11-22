import { Shadows, styled } from 'lib/stitches.config';

export const StyledInlineCode = styled('code', {
  fontFamily: 'var(--font-mono-code)',
  lineHeight: '1.45rem',
  borderRadius: 'var(--border-radius-1)',
  backgroundColor: 'var(--foreground)',
  color: 'var(--token-punctuation)',
  padding: '2px 6px',
  paddingInline: '6px',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-400) !important',
  wordBreak: 'break-word',
  border: '1px solid var(--border-color)',
  boxShadow: Shadows[1],
  '-webkit-box-decoration-break': 'clone',
});
