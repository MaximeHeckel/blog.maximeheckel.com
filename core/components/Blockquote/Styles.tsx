import { styled } from 'lib/stitches.config';

export const StyledBlockquote = styled('blockquote', {
  /**
   * Make it fullbleed!
   */
  margin: '0 -50vw 2.25rem -50vw',
  position: 'relative',
  left: '50%',
  right: '50%',
  width: '100vw',

  paddingTop: '40px',
  paddingBottom: '40px',
  background: 'var(--maximeheckel-colors-emphasis)',
  backdropFilter: 'blur(6px)',

  p: {
    marginBottom: 0,
  },

  div: {
    maxWidth: '880px !important',
    padding: '0 32px',
    width: '100%',
    margin: '0 auto',
    fontSize: '27px',
    lineHeight: '1.6818',
    fontWeight: '400',
    fontStyle: 'italic',
    color: 'var(--maximeheckel-colors-typeface-primary)',
  },
});
