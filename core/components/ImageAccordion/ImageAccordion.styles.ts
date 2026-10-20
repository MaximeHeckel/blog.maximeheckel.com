import { styled } from '@maximeheckel/design-system';
import NextImage from 'next/image';

export const Strip = styled('div', {
  display: 'flex',
  width: '100%',
  minWidth: 0,
  overflow: 'hidden',
});

export const Cell = styled('button', {
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
    outlineOffset: -2,
  },
});

export const Image = styled(NextImage, {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  userSelect: 'none',
  pointerEvents: 'none',
});
