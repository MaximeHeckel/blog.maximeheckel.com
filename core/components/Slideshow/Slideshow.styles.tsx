import { keyframes, styled } from '@maximeheckel/design-system';
import { motion } from 'motion/react';

import { glassBorderShine } from '../GlassBorder.styles';

const glassControlBorder = {
  ...glassBorderShine,
  '--glass-border-base': 'oklch(from var(--gray-1100) l c h / 8%)',
};

const fill = keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(0)' },
});

export const GalleryContainer = styled('section', {
  position: 'relative',
  width: '100%',
  isolation: 'isolate',
  borderRadius: 'var(--border-radius-3)',

  '&:focus-visible': {
    outline: '2px solid var(--accent)',
    outlineOffset: 'var(--space-1)',
  },
});

export const VisuallyHidden = styled('span', {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
});

export const GallerySurface = styled('div', {
  position: 'relative',
  borderRadius: 'inherit',
  // Establish a local backdrop root so glass controls never sample the whole page.
  clipPath: 'inset(0 round var(--border-radius-3))',
});

export const Viewport = styled('div', {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 'inherit',
  background: 'var(--foreground)',
  border: '1px solid var(--border-color)',

  '&[data-swipeable="true"]': {
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'pan-y pinch-zoom',

    '&[data-orientation="vertical"]': {
      touchAction: 'pan-x pinch-zoom',
    },
  },

  '&[data-grabbing="true"]': {
    cursor: 'grabbing',
  },

  '& img': {
    WebkitUserDrag: 'none',
    WebkitTouchCallout: 'none',
  },
});

export const DragTrack = styled(motion.div, {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

export const DragSlide = styled('div', {
  position: 'absolute',
  inset: 0,

  '& img': {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export const ImageTrack = styled('div', {
  display: 'flex',
  width: '100%',
  transition: 'transform 500ms cubic-bezier(0.215, 0.61, 0.355, 1)',

  '&[data-transition="fade"], &[data-orientation="vertical"]': {
    display: 'grid',
    transition: 'none',
  },

  '&[data-dragging="true"]': {
    opacity: 0,
    transition: 'none',
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

export const ImageSlide = styled('div', {
  position: 'relative',
  flex: '0 0 100%',
  minWidth: 0,

  '&[data-orientation="vertical"]': {
    gridArea: '1 / 1',
    transition: 'transform 500ms cubic-bezier(0.215, 0.61, 0.355, 1)',

    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },

  '&[data-transition="fade"]': {
    gridArea: '1 / 1',
    opacity: 0,
    transition: 'opacity 500ms cubic-bezier(0.215, 0.61, 0.355, 1)',

    '&[data-active="true"]': {
      opacity: 1,
      zIndex: 1,
    },

    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },

  '&[data-dragging="true"]': {
    transition: 'none',
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },

  '& img': {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export const Controls = styled('div', {
  position: 'absolute',
  zIndex: 2,
  bottom: 'var(--space-4)',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  maxWidth: 'calc(100% - var(--space-4))',

  '&[data-orientation="vertical"]': {
    bottom: 'var(--space-2)',
    left: 'var(--space-4)',
    top: 'var(--space-2)',
    transform: 'none',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

export const Steps = styled('div', {
  ...glassControlBorder,
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--space-1)',
  borderRadius: 'var(--space-8)',

  '&[data-orientation="vertical"]': {
    flexDirection: 'column',
    minHeight: 0,
    overflowY: 'auto',
    scrollbarWidth: 'none',
  },
});

export const Step = styled('button', {
  appearance: 'none',
  position: 'relative',
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  border: 0,
  padding: 'var(--space-2)',
  width: 'var(--space-5)',
  height: 'var(--space-5)',
  borderRadius: 'var(--border-radius-2)',
  background: 'transparent',
  cursor: 'pointer',
  transition:
    'width 500ms cubic-bezier(0.215, 0.61, 0.355, 1), height 500ms cubic-bezier(0.215, 0.61, 0.355, 1)',

  '&[aria-selected="true"]': {
    width: 'var(--space-7)',
  },

  '&[data-orientation="vertical"]': {
    width: 'var(--space-5)',
    height: 'var(--space-5)',
    '&[aria-selected="true"]': {
      height: 'var(--space-7)',
    },
  },

  '&:focus-visible': {
    outline: '2px solid var(--accent)',
    outlineOffset: -2,
  },

  '&:hover > span': {
    opacity: 1,
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

export const Dot = styled('span', {
  display: 'block',
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  height: 'var(--space-2)',
  borderRadius: 'var(--space-8)',
  backgroundColor: 'oklch(from var(--text-primary) l c h / 30%)',
  transition:
    'background-color 500ms cubic-bezier(0.215, 0.61, 0.355, 1), transform 500ms cubic-bezier(0.215, 0.61, 0.355, 1)',

  '&[data-active="true"][data-progress="false"]': {
    backgroundColor: 'var(--text-primary)',
  },

  '&[data-edge="true"]': {
    transform: 'scale(0.65)',
  },

  '&[data-orientation="vertical"]': {
    width: 'var(--space-2)',
    height: '100%',
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

export const Fill = styled('span', {
  position: 'absolute',
  inset: 0,
  background: 'var(--text-primary)',
  borderRadius: 'inherit',
  animationName: `${fill}`,
  animationTimingFunction: 'linear',
  animationFillMode: 'both',
  willChange: 'transform',

  '&[data-orientation="vertical"]': {
    animationName: `${keyframes({
      from: { transform: 'translateY(-100%)' },
      to: { transform: 'translateY(0)' },
    })}`,
  },

  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transform: 'none',
    willChange: 'auto',

    '&[data-orientation="vertical"]': {
      animationName: 'none',
    },
  },
});

export const ControlButton = styled('button', {
  ...glassControlBorder,
  appearance: 'none',
  position: 'relative',
  isolation: 'isolate',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 'var(--space-6)',
  height: 'var(--space-6)',
  padding: 0,
  border: 0,
  borderRadius: '50%',
  color: 'var(--text-primary)',
  background: 'transparent',
  cursor: 'pointer',
  transition:
    'color 240ms cubic-bezier(0.4, 0, 0.2, 1), transform 420ms cubic-bezier(0.4, 0, 0.2, 1)',

  '@media (hover: hover) and (pointer: fine)': {
    '&:hover:not(:disabled)': {
      transform: 'scale(1.07)',
    },
  },

  '&:active:not(:disabled)': {
    transform: 'scale(0.96)',
    transition: 'color 180ms ease, transform 100ms ease-out',
  },

  '&:disabled': { cursor: 'default' },
  '&:disabled svg': { opacity: 0.4 },
  '&:focus-visible': {
    outline: '2px solid var(--accent)',
    outlineOffset: 2,
  },
  '& svg': { width: 'var(--space-4)', height: 'var(--space-4)' },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',

    '&:hover:not(:disabled), &:active:not(:disabled)': {
      transform: 'none',
      transition: 'none',
    },
  },
});
