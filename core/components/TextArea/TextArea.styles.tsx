import { styled } from 'lib/stitches.config';

export const StyledTextArea = styled('textarea', {
  WebkitAppearance: 'none',
  MozAppearance: 'none',

  width: '100%',
  outline: 'none',
  position: 'relative',
  display: 'block',
  margin: 0,
  padding: '8px 16px',

  fontSize: 'var(--font-size-1)',
  fontFamily: 'inherit',
  lineHeight: '26px',
  color: 'var(--text-primary)',

  borderRadius: 'var(--border-radius-1)',
  border: '1px solid var(--border-color, var(--input-border))',
  background: 'var(--background, var(--input-background))',
  cursor: 'var(--cursor, initial)',
  opacity: 'var(--opacity, 1)',
  boxShadow: 'var(--shadow, none)',
  transition: 'border-color 0.3s, box-shadow 0.3s',

  '--shadow-hover-primary': '0 2px 20px -2px var(--input-focus)',

  '&::placeholder': {
    color: 'var(--text-tertiary)',
    opacity: 0.5,
  },

  '&::-webkit-autofill': {
    background: 'transparent',
  },

  '&:disabled': {
    '--background': 'var(--input-disabled)',
    cursor: 'not-allowed',
    opacity: 0.4,
    filter: 'grayscale(0.25)',
    '& + label': {
      cursor: 'not-allowed',
    },
  },

  '&:hover': {
    '&:not(:disabled)': {
      '--border-color': 'var(--input-active)',
      '--shadow': 'var(--shadow-hover-primary)',
    },
  },

  '&:focus': {
    '--border-color': 'var(--input-active)',
    '--shadow': 'var(--shadow-hover-primary)',
  },

  variants: {
    readOnly: {
      true: {
        '--cursor': 'default',
      },
    },
    resize: {
      none: {
        resize: 'none',
      },
      vertical: {
        resize: 'vertical',
      },
      horizontal: {
        resize: 'horizontal',
      },
    },
  },
});
