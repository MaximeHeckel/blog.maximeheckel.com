import { styled } from 'lib/stitches.config';

export const StyledBlockquote = styled('blockquote', {
  transition: '0.5s',
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
    maxWidth: '880px !important',
    paddingLeft: '50px',
    paddingBottom: '0',
    width: '100%',
    margin: '0 auto',
    fontSize: '27px',
    lineHeight: '1.6818',
    fontWeight: '400',
    fontStyle: 'italic',
    color: 'var(--maximeheckel-colors-typeface-primary)',
  },
});
