import { Box, styled } from '@maximeheckel/design-system';

export const Wrapper = styled(Box, {
  position: 'relative',

  overflow: 'hidden',
  display: 'flex',
  borderRadius: 'var(--border-radius-2)',
  border: '4px solid var(--maximeheckel-border-color)',
  cursor: 'ew-resize',
  transition: 'box-shadow 0.3s',
  boxShadow: 'var(--shadow, none)',

  '&:focus-visible': {
    outline: 'none',
    boxShadow: '0 2px 20px -2px var(--maximeheckel-form-input-focus)',
  },
});

export const Image = styled('img', {
  pointerEvents: 'none',
  userDrag: 'none',
  userSelect: 'none',
  objectFit: 'cover',
  width: '100%',
  height: '100%',
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
