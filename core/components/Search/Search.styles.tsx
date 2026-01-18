import { Dialog } from '@base-ui/react/dialog';
import { Box, keyframes, styled } from '@maximeheckel/design-system';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1.0 },
});

const overlayHide = keyframes({
  '0%': { opacity: 0.7 },
  '100%': { opacity: 0 },
});

export const Backdrop = styled(Dialog.Backdrop, {
  opacity: 0.5,
  position: 'fixed',
  inset: 0,
  zIndex: '100',
  background: 'oklch(from var(--background) l c h / 80%)',
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-open]': {
      animation: `${overlayShow} 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
    },

    '&[data-closed]': {
      animation: `${overlayHide} var(--exit-duration, 0ms) ease-in-out forwards`,
    },
  },
});

export const Popup = styled(Dialog.Popup, {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '600px',
  zIndex: '101',

  '@media (max-width: 700px)': {
    width: '95%',
  },

  '&:focus': { outline: 'none' },
});

export const SearchBox = styled(Box, {
  width: '100%',
  position: 'relative',
});

export const FormWrapper = styled(Box, {
  position: 'relative',
  margin: '0 auto',
  background: 'transparent',
  borderTopLeftRadius: 'var(--border-radius-2)',
  borderTopRightRadius: 'var(--border-radius-2)',
  border: 'none',

  form: {
    margin: '0px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const SearchInput = styled('input', {
  background: 'transparent',
  border: 'none',
  fontSize: '14px',
  fontFamily: 'inherit',
  fontWeight: '400',
  height: '48px',
  padding: '0px 8px',
  width: '100%',
  outline: 'none',
  color: 'var(--text-primary)',

  '&::placeholder': {
    color: 'var(--text-secondary)',
    opacity: '0.54',
  },
  '&::-webkit-input-placeholder': {
    color: 'var(--text-secondary)',
    opacity: '0.54',
  },
  '&:-ms-input-placeholder': {
    color: 'var(--text-secondary)',
    opacity: '0.54',
  },

  WebkitAppearance: 'none',
  MozAppearance: 'none',
  outlineOffset: '-2px',

  '&::-webkit-search-cancel-button': {
    WebkitAppearance: 'none',
  },
  '&::-webkit-search-decoration': {
    WebkitAppearance: 'none',
  },
  '&::-webkit-file-upload-button': {
    WebkitAppearance: 'button',
    font: 'inherit',
  },

  '&::-webkit-autofill': {
    background: 'transparent',
    color: 'var(--text-primary)',
  },

  '@media (max-width: 500px)': {
    fontSize: '16px',
  },
});

export const AIInput = styled(SearchInput, {
  padding: '0px 8px',
  '&:disabled': {
    cursor: 'not-allowed',
  },
});
