import { styled } from '@maximeheckel/design-system';

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
    fontSize: 'var(--font-size-6) !important',
    lineHeight: '1.6818 !important',
    fontWeight: 'var(--font-weight-2) !important',
    fontStyle: 'italic',
  },

  div: {
    maxWidth: '880px !important',
    padding: '0 20px',
    width: '100%',
    margin: '0 auto',
    color: 'var(--maximeheckel-colors-typeface-primary)',
  },
});
