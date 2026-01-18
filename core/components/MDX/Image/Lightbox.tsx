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
  backgroundColor: 'oklch(from var(--background) l c h / 80%)',
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
});
