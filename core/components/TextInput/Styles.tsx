import { styled } from '@maximeheckel/design-system';

export const StyledInput = styled('input', {
  WebkitAppearance: 'none',
  MozAppearance: 'none',

  width: '100%',
  outline: 'none',
  position: 'relative',
  display: 'block',
  margin: 0,
  padding: 'var(--input-inner-padding, 8px 40px 8px 16px)',

  fontSize: 'var(--font-size-2)',
  fontFamily: 'inherit',
  lineHeight: '26px',
  color: 'var(--maximeheckel-colors-typeface-primary)',

  borderRadius: 'var(--border-radius-1)',
  border:
    '1px solid var(--border-color, var(--maximeheckel-form-input-border))',
  background: 'var(--background, var(--maximeheckel-form-input-background))',

  transition: 'border-color 0.3s, box-shadow 0.3s',

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

  variants: {
    variant: {
      email: {
        '--input-inner-padding': '8px 16px 8px 40px',
      },
      password: {},
      search: {},
      text: {},
      url: {},
    },
  },
});

export const StyledInputWrapper = styled('div', {
  display: 'inline-block',
  position: 'relative',
  width: '100%',

  '--shadow-hover-primary':
    '0 2px 20px -2px var(--maximeheckel-form-input-focus)',

  svg: {
    display: 'block',
    position: 'absolute',
    fill: 'none',
    stroke: 'var(--icon-color, var(--maximeheckel-form-input-border))',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.6,
    transition: 'stroke 0.3s',
  },

  input: {
    boxShadow: 'var(--shadow, none)',

    '&:not(:placeholder-shown)': {
      '&:not(:disabled)': {
        '&:not(:focus)': {
          '& + svg': {
            '--icon-color': 'var(--maximeheckel-form-input-active)',
          },

          '& + button': {
            svg: {
              '--icon-color': 'var(--maximeheckel-form-input-active)',
            },
          },
        },
      },
    },
  },

  '&:hover': {
    input: {
      '&:not(:disabled)': {
        '--shadow': 'var(--shadow-hover-primary)',
        '--border-color': 'var(--maximeheckel-form-input-active)',
        '& + svg': {
          '--icon-color': 'var(--maximeheckel-form-input-active)',
        },
        '& + button': {
          svg: {
            '--icon-color': 'var(--maximeheckel-form-input-active)',
          },
        },
      },
    },
  },

  '&:focus-within': {
    '--border-color': 'var(--maximeheckel-form-input-active)',
    '--icon-color': 'var(--maximeheckel-form-input-active)',
    '--shadow': 'var(--shadow-hover-primary)',
  },

  variants: {
    variant: {
      email: {
        svg: {
          top: '12px',
          left: '12px',
        },

        '&.valid': {
          '--at-sign': '150',
          '--at-sign-delay': '0s',
          '--tick': '0',
          '--tick-delay': '0.5s',
          '--icon-color': 'hsl(var(--palette-green-65))',
        },
      },
      password: {
        button: {
          position: 'absolute',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          height: '22px',
          width: '22px',
          top: '12px',
          right: '14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '50%',
          outline: 'none',
          transition: 'box-shadow 0.2s',
          padding: '0px',

          '&:focus-visible': {
            boxShadow: '0 0 0 2px var(--maximeheckel-colors-brand)',
          },

          '&:disabled': {
            cursor: 'not-allowed',
          },

          svg: {
            position: 'initial',
          },

          '&.clicked': {
            '--eye': '0',
            '--eye-delay': '0s',
            '--strike': '24',
            '--strike-delay': '0s',
          },
        },
      },
      search: {},
      text: {},
      url: {},
    },
  },
});
