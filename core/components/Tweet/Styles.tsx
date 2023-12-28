import { css, Shadows, styled } from '@maximeheckel/design-system';

export const TweetWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--border-radius-2)',
  backgroundColor: 'var(--card-background)',
  padding: '1rem 1.5rem',
  width: '100%',

  border: 'solid 1px var(--border-color)',
  boxShadow: Shadows[1],

  // '@media (max-width: 700px)': {
  //   /**
  //    * Make it fullbleed!
  //    */
  //   width: '100vw',
  //   position: 'relative',
  //   left: '50%',
  //   right: '50%',
  //   marginLeft: '-50vw',
  //   marginRight: '-50vw',
  //   borderRadius: '0px',
  // },
});

export const Avatar = styled('a', {
  display: 'flex',
  height: '46px',
  width: '46px',
  borderRadius: '50%',
  overflow: 'hidden',
});

export const Name = styled('a', {
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '1rem',
  color: 'var(--text-primary)',
  textDecoration: 'none',
});

export const ImageGrid = styled('div', {
  display: 'inline-grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: '0.5rem',
  rowGrap: '0.5rem',
});

export const SingleImageWrapper = styled('div', {});

export const ActionIcons = styled('a', {
  display: 'flex',
  alignItems: 'center',
  marginRight: '1rem',
  color: 'var(--text-tertiary)',
  textDecoration: 'none',

  svg: {
    marginRight: '0.25rem',
  },
});

export const singleImage = css({
  borderRadius: 'var(--border-radius-2)',
});
