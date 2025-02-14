import { styled } from '@maximeheckel/design-system';
import * as Dialog from '@radix-ui/react-dialog';

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
  cursor: 'zoom-out',
});

export const Content = styled(Dialog.Content, {
  backgroundColor: 'transparent',
  zIndex: '101',
  '&:focus': { outline: 'none' },
});

export const Trigger = styled(Dialog.Trigger, {
  all: 'unset',
  cursor: 'zoom-in',
  width: '100%',
});
