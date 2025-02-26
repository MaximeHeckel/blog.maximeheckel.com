import { css, Shadows, styled } from '@maximeheckel/design-system';

export const TweetWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--border-radius-2)',
  backgroundColor: 'var(--card-background)',
  padding: '16px',
  width: '100%',

  border: 'solid 1px var(--border-color)',
  boxShadow: Shadows[1],
});

export const Avatar = styled('a', {
  display: 'flex',
  height: '40px',
  width: '40px',
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
