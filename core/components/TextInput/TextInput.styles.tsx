import { styled } from 'styled-system/jsx';

export const StyledInput = styled('input', {
  base: {
    WebkitAppearance: 'none',

    width: '100%',
    outline: 'none',
    position: 'relative',
    display: 'block',
    margin: 0,
    padding: 'var(--input-inner-padding, 4px 40px 4px 12px)',

    fontSize: 'var(--font-size-1)',
    fontFamily: 'inherit',
    lineHeight: '26px',
    color: 'var(--text-primary)',

    borderRadius: 'var(--border-radius-1)',
    border: '1px solid var(--border-color, var(--input-border))',
    background: 'var(--background, var(--input-background))',

    transition: 'border-color 0.3s, box-shadow 0.3s',

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
  },

  variants: {
    variant: {
      email: {
        '--input-inner-padding': '4px 12px 4px 40px',
      },
      password: {},
      search: {},
      text: {},
      url: {},
    },
  },
});

export const StyledInputWrapper = styled('div', {
  base: {
    display: 'inline-block',
    position: 'relative',
    width: '100%',

    '--shadow-hover-primary': '0 2px 20px -2px var(--input-focus)',

    '& svg': {
      display: 'block',
      position: 'absolute',
      fill: 'none',
      stroke: 'var(--icon-color, var(--input-border))',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: 1.6,
      transition: 'stroke 0.3s',
    },

    '& input': {
      boxShadow: 'var(--shadow, none)',

      '&:not(:placeholder-shown)': {
        '&:not(:disabled)': {
          '&:not(:focus)': {
            '& + svg': {
              '--icon-color': 'var(--input-active)',
            },

            '& + button': {
              '& svg': {
                '--icon-color': 'var(--input-active)',
              },
            },
          },
        },
      },
    },

    '&:hover': {
      '& input': {
        '&:not(:disabled)': {
          '--shadow': 'var(--shadow-hover-primary)',
          '--border-color': 'var(--input-active)',
          '& + svg': {
            '--icon-color': 'var(--input-active)',
          },
          '& + button': {
            '& svg': {
              '--icon-color': 'var(--input-active)',
            },
          },
        },
      },
    },

    '&:focus-within': {
      '--border-color': 'var(--input-active)',
      '--icon-color': 'var(--input-active)',
      '--shadow': 'var(--shadow-hover-primary)',
    },
  },

  variants: {
    variant: {
      email: {
        '& svg': {
          top: '9px',
          left: '12px',
        },

        '&.valid': {
          '--at-sign': '150',
          '--at-sign-delay': '0s',
          '--tick': '0',
          '--tick-delay': '0.5s',
          '--icon-color': 'var(--green-1000)',
        },
      },
      password: {
        '& button': {
          position: 'absolute',
          WebkitAppearance: 'none',

          height: '22px',
          width: '22px',
          top: '9px',
          right: '14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '50%',
          outline: 'none',
          transition: 'box-shadow 0.2s',
          padding: '0px',

          '&:focus-visible': {
            boxShadow: '0 0 0 2px var(--accent)',
          },

          '&:disabled': {
            cursor: 'not-allowed',
          },

          '& svg': {
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
