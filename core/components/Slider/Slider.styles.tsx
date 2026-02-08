import { Slider } from '@base-ui/react/slider';
import { Box, styled } from '@maximeheckel/design-system';

export const SliderRoot = styled(Slider.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  overflow: 'clip',
  backgroundColor: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
  cursor: 'grab',

  '&:active': {
    cursor: 'grabbing',
  },

  '[data-disabled]': {
    cursor: 'not-allowed !important',
  },

  '&:has(:focus-visible)': {
    outline: '2px solid var(--blue-800)',
    outlineOffset: 2,
  },

  variants: {
    size: {
      sm: {
        height: '34px',
        borderRadius: '8px',
      },
      md: {
        height: '48px',
        borderRadius: '12px',
      },
    },
  },
});

export const Control = styled(Slider.Control, {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  touchAction: 'none',
  userSelect: 'none',

  variants: {
    size: {
      sm: {
        height: '34px',
      },
      md: {
        height: '48px',
      },
    },
  },
});

export const Track = styled(Slider.Track, {
  position: 'relative',
  flexGrow: 1,
  height: '100%',

  userSelect: 'none',
});

export const Indicator = styled(Slider.Indicator, {
  userSelect: 'none',
  position: 'absolute',

  height: '100%',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    transition: 'opacity 0.15s ease-in-out',
    opacity: 'var(--thumb-opacity, 1)',
    transform: 'translate(-50%, -50%)',
    right: 'var(--right-offset, auto)',
    left: 'var(--left-offset, auto)',
    width: '2px',
    backgroundColor:
      'oklch(from var(--text-primary) l c h / var(--opacity, 0.5))',
    borderRadius: '9999px',
    height: '20px',
  },
});

export const Thumb = styled(Slider.Thumb, {
  display: 'block',
  opacity: 1,
  backgroundColor: 'rgba(220, 38, 38, 0.0)',
  width: '20px',
  height: '44px',
  borderRadius: '9999px',
  position: 'relative',
  zIndex: 1,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    left: '50%',
    width: '2px',
    borderRadius: '9999px',
    height: '24px',
  },
});

export const SliderLabel = styled(Box, {
  position: 'absolute',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 16px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '12px',
  opacity: 0.9,
  pointerEvents: 'none',
});

export const SliderStepsDots = styled(Box, {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
});
