import { Dialog } from '@base-ui/react/dialog';
import { styled } from '@maximeheckel/design-system';

export const Backdrop = styled(Dialog.Backdrop, {
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
  cursor: 'zoom-out',
  backgroundColor: 'oklch(from var(--background) l c h / 0.8)',
  transition: 'background-color 140ms ease',

  '&[data-starting-style], &[data-ending-style]': {
    backgroundColor: 'oklch(from var(--background) l c h / 0)',
  },
});

export const ImageFrame = styled('div', {
  position: 'relative',
  boxSizing: 'border-box',
  overflow: 'hidden',
  lineHeight: 0,
  border: '2px solid var(--border-color)',
  borderRadius: 'var(--border-radius-3)',
});

export const Popup = styled(Dialog.Popup, {
  backgroundColor: 'transparent',
  zIndex: '101',
  '&:focus': { outline: 'none' },
});

export const Trigger = styled(Dialog.Trigger, {
  all: 'unset',
  cursor: 'zoom-in',
  width: '100%',
  height: '100%',
  lineHeight: 0,
});
