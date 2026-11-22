import { styled } from 'lib/stitches.config';

import Box from '../Box';

export const BlockquoteWrapper = styled('blockquote', {
  paddingTop: '32px',
  paddingBottom: '32px',
  width: '100%',
  margin: 0,
});

export const BlockquoteContent = styled(Box, {
  maxWidth: '1020px',
  padding: '0 var(--space-2)',
  textAlign: 'center',
  width: '100%',
  margin: '0 auto',
  color: 'var(--text-primary)',

  p: {
    fontFamily: 'var(--font-serif)',
    marginBottom: 0,
    fontStyle: 'italic',
    fontSize: 'var(--font-size-7) !important',
    lineHeight: '1.6818 !important',
    fontWeight: 'var(--font-weight-400) !important',
  },
});
