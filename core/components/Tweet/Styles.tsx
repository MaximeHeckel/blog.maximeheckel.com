import { Shadows } from 'lib/tokens/shadows';
import { css } from 'styled-system/css';
import { styled } from 'styled-system/jsx';

export const TweetWrapper = styled('div', {
  base: {
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
  },
});

export const Avatar = styled('a', {
  base: {
    display: 'flex',
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
  },
});

export const Name = styled('a', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '1rem',
    color: 'var(--text-primary)',
    textDecoration: 'none',
  },
});

export const ImageGrid = styled('div', {
  base: {
    display: 'inline-grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '0.5rem',
  },
});

export const SingleImageWrapper = styled('div', {});

export const ActionIcons = styled('a', {
  base: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '1rem',
    color: 'var(--text-tertiary)',
    textDecoration: 'none',

    '& svg': {
      marginRight: '0.25rem',
    },
  },
});

export const singleImage = css({
  borderRadius: 'var(--border-radius-2)',
});
