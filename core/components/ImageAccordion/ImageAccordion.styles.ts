import NextImage from 'next/image';
import { styled } from 'styled-system/jsx';

export const Strip = styled('div', {
  base: {
    display: 'flex',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
  },
});

export const Cell = styled('button', {
  base: {
    appearance: 'none',
    position: 'relative',
    flexBasis: 0,
    minWidth: 0,
    height: '100%',
    overflow: 'hidden',
    padding: 0,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--accent)',
      outlineOffset: '-2px',
    },
  },
});

export const Image = styled(NextImage, {
  base: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    userSelect: 'none',
    pointerEvents: 'none',
  },
});
