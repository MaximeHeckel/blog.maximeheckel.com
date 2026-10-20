import { Box, styled } from '@maximeheckel/design-system';
import NextImage from 'next/image';

export const Wrapper = styled(Box, {
  position: 'relative',

  overflow: 'hidden',
  display: 'flex',
  borderRadius: 'var(--border-radius-2)',
  border: '2px solid var(--border-color)',
  cursor: 'ew-resize',
  touchAction: 'pan-y pinch-zoom',
  transition: 'box-shadow 0.3s',
  boxShadow: 'var(--shadow, none)',

  '&:focus-visible': {
    outline: 'none',
    boxShadow: '0 2px 20px -2px var(--input-focus)',
  },
});

export const Image = styled(NextImage, {
  pointerEvents: 'none',
  userDrag: 'none',
  userSelect: 'none',
  width: '100%',
  height: 'auto',
});

export const Surface = styled(Box, {
  position: 'relative',
  display: 'flex',
  width: '100%',
  // Keep glass backdrops local to both images without clipping the focus ring.
  clipPath: 'inset(0)',
});

export const Labels = styled('div', {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  pointerEvents: 'none',
});

export const Divider = styled('svg', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  pointerEvents: 'none',
  color: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.6))',
});

export const Label = styled('div', {
  pointerEvents: 'none',
  position: 'absolute',
  top: 'var(--space-4)',
  isolation: 'isolate',
  borderRadius: 'var(--space-8)',
  padding: 'var(--space-1) var(--space-3)',
  transition: 'opacity 120ms ease-out',

  variants: {
    side: {
      before: { left: 'var(--space-4)' },
      after: { right: 'var(--space-4)' },
    },
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

export const Overlay = styled(Box, {
  position: 'absolute',
  zIndex: 1,
  top: 0,
  left: 0,
  overflow: 'hidden',
  height: '100%',
  clipPath: 'inset(0px 0px 0px var(--progress))',
});
