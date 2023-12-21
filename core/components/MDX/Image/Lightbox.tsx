import { keyframes, styled } from '@maximeheckel/design-system';
import * as Dialog from '@radix-ui/react-dialog';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1.0 },
});

const overlayHide = keyframes({
  '0%': { opacity: 0.7 },
  '100%': { opacity: 0 },
});

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'scale(.96)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
});

const contentHide = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

export const Overlay = styled(Dialog.Overlay, {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  padding: '32px 0px',
  zIndex: '100',
  display: 'grid',
  placeItems: 'center',
  overflowY: 'auto',
  backdropFilter: 'blur(15px)',
  cursor: 'zoom-out',
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${overlayShow} 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
    },

    '&[data-state="closed"]': {
      animation: `${overlayHide} var(--exit-duration, 0ms) ease-in-out forwards`,
    },
  },
});

export const Content = styled(Dialog.Content, {
  maxWidth: 1400,
  width: '95vw',
  backgroundColor: 'transparent',
  zIndex: '100',

  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${contentShow} 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
    },

    '&[data-state="closed"]': {
      animation: `${contentHide} var(--exit-duration, 0ms) ease-in-out forwards`,
    },
  },
  '&:focus': { outline: 'none' },
});

export const Trigger = styled(Dialog.Trigger, {
  all: 'unset',
  cursor: 'zoom-in',
  width: '100%',
});
