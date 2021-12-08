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

  fontSize: 'var(--font-size-2)',
  fontFamily: 'inherit',
  lineHeight: '26px',
  color: 'var(--maximeheckel-colors-typeface-primary)',

  borderRadius: 'var(--border-radius-1)',
  border:
    '1px solid var(--border-color, var(--maximeheckel-form-input-border))',
  background: 'var(--background, var(--maximeheckel-form-input-background))',
  cursor: 'var(--cursor, initial)',
  opacity: 'var(--opacity, 1)',
  boxShadow: 'var(--shadow, none)',
  transition: 'border-color 0.3s, box-shadow 0.3s',

  '--shadow-hover-primary':
    '0 2px 20px -2px var(--maximeheckel-form-input-focus)',

  '&::placeholder': {
    color: 'var(--maximeheckel-colors-typeface-tertiary)',
    opacity: 0.5,
  },

  '&::-webkit-autofill': {
    background: 'transparent',
  },

  '&:disabled': {
    '--background': 'var(--maximeheckel-form-input-disabled)',
    cursor: 'not-allowed',
    opacity: 0.65,
    '& + label': {
      cursor: 'not-allowed',
    },
  },

  '&:hover': {
    '&:not(:disabled)': {
      '--border-color': 'var(--maximeheckel-form-input-active)',
      '--shadow': 'var(--shadow-hover-primary)',
    },
  },

  '&:focus': {
    '--border-color': 'var(--maximeheckel-form-input-active)',
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
