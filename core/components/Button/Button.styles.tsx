import { styled } from 'styled-system/jsx';

import { glassMaterialPrimitives } from '../GlassMaterial';

export const StyledButton = styled('button', {
  base: {
    WebkitAppearance: 'none',
    WebkitTapHighlightColor: 'transparent',
    WebkitUserSelect: 'none',

    userSelect: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: '0',
    outline: 'none',
    cursor: 'pointer',
    border: '0',
    /* Constant properties */
    fontSize: 'var(--font-size-1)',
    fontWeight: 'var(--font-weight-500)',
    height: '34px',
    width: 'max-content',
    padding: '0px 12px',
    transition: 'background 0.2s, transform 0.2s, color 0.2s, box-shadow 0.3s',
    borderRadius: 'var(--border-radius-1)',

    /* Computed properties */
    background: 'var(--button-background, white)',
    color: 'var(--color, black)',
    transform: 'scale(var(--button-scale, 1)) translateZ(0)',
    boxShadow: 'var(--shadow, none)',
    opacity: 'var(--opacity, 1)',
    '--shadow-hover-primary': '0 2px 40px -4px var(--input-focus)',

    '& svg': {
      width: '18px',
      height: '18px',
    },

    '&:active': {
      '--button-scale': '0.95',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      '--button-scale': '1.0 !important',
      '--shadow': 'none !important',
      '--opacity': '0.4',
      filter: 'grayscale(0.25)',
    },
  },
  variants: {
    hasIcon: {
      startIcon: {
        padding: '0px 12px 0px 10px',
      },
      endIcon: {
        padding: '0px 10px 0px 12px',
      },
      none: {
        padding: '0px 12px',
      },
    },
    variant: {
      primary: {
        '--button-background': 'var(--accent)',
        '--color': 'var(--white)',
        '--shadow':
          'inset 0px 1px 1px rgba(255, 255, 255, 0.3), inset 0px -1.5px 2px rgba(0, 0, 0, 0.3)',

        '&:hover': {
          '&:not(:disabled)': {
            '--shadow':
              'inset 0px 1px 1px rgba(255, 255, 255, 0.3), inset 0px -1.5px 2px rgba(0, 0, 0, 0.3), var(--shadow-hover-primary)',
          },
        },

        '&:focus-visible': {
          '--shadow':
            'inset 0px 1px 1px rgba(255, 255, 255, 0.3), inset 0px -1.5px 2px rgba(0, 0, 0, 0.3), var(--shadow-hover-primary)',
        },

        '&:active': {
          '--shadow':
            'inset 0px -1px 1px rgba(255, 255, 255, 0.2), inset 0px -1.5px 2px rgba(0, 0, 0, 0.3)',
        },
      },
      secondary: {
        '--button-background': 'transparent',
        '--color': 'var(--accent)',

        '&:hover': {
          '&:not(:disabled)': {},
        },

        '&:focus-visible': {},
      },

      tertiary: {
        '--button-background': 'transparent',
        '--color': 'var(--text-tertiary)',

        '&:hover': {
          '&:not(:disabled)': {
            '--button-background': glassMaterialPrimitives['background-color'],
            '--color': 'var(--text-primary)',
          },
        },

        '&:focus-visible': {
          '--button-background': glassMaterialPrimitives['background-color'],
          '--color': 'var(--text-primary)',
        },
      },
    },

    inverted: {
      true: {},
      false: {},
    },
    rounded: {
      true: {
        borderRadius: '9999px',
      },
      false: {},
    },
  },

  compoundVariants: [
    {
      variant: 'primary',
      inverted: true,
      css: {
        '--button-background': 'var(--text-primary)',
        '--color': 'var(--background)',
      },
    },
    {
      variant: 'secondary',
      inverted: true,
      css: {},
    },
  ],
});

export const StyledIconButton = styled('button', {
  base: {
    WebkitAppearance: 'none',
    WebkitTapHighlightColor: 'transparent',
    WebkitUserSelect: 'none',

    userSelect: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: '0',
    outline: 'none',
    cursor: 'pointer',
    opacity: 'var(--opacity, 1)',

    background: 'var(--button-background, var(--foreground))',
    color: 'var(--color, var(--text-tertiary))',
    transform: 'scale(var(--button-content-scale, 1)) translateZ(0)',
    '--shadow-hover-primary': '0 2px 40px -4px var(--input-focus)',
    borderRadius: 'var(--corner, var(--border-radius-1))',
    boxShadow: 'var(--shadow, none)',
    border:
      'var(--border-thickness, 1px) solid var(--border-color, oklch(from var(--border-color) l c h / 60%))',

    transition:
      'box-shadow 0.3s ease, border 0.2s, border-color 0.2s, color 0.3s ease, background 0.3s ease, transform 0.2s',

    '&:disabled': {
      cursor: 'not-allowed',
      '--button-scale': '1.0 !important',
      '--shadow': 'none !important',
      '--opacity': '0.4',
      filter: 'grayscale(0.25)',
    },

    '&:hover': {
      '--button-content-scale': '1.1',
    },

    '&:focus-visible': {
      '--button-content-scale': '1.1',
    },

    '&:active': {
      '--button-content-scale': '0.95',
    },
  },

  variants: {
    variant: {
      primary: {
        '--button-background': 'var(--accent)',
        '--border-color': 'transparent',
        '--border-thickness': '0px',
        '--color': 'var(--text-primary)',
        '--shadow':
          'inset 0px 1px 1px rgba(255, 255, 255, 0.3), inset 0px -1.5px 2px rgba(0, 0, 0, 0.3)',

        '&:hover': {
          '&:not(:disabled)': {
            '--shadow':
              'inset 0px 1px 1px rgba(255, 255, 255, 0.3), inset 0px -1.5px 2px rgba(0, 0, 0, 0.3), var(--shadow-hover-primary)',
          },
        },

        '&:focus-visible': {
          '--shadow':
            'inset 0px 1px 1px rgba(255, 255, 255, 0.3), inset 0px -1.5px 2px rgba(0, 0, 0, 0.3), var(--shadow-hover-primary)',
        },
      },
      secondary: {
        '--button-background': glassMaterialPrimitives['background-color'],
        border: glassMaterialPrimitives['border'],
        '--color': 'var(--text-secondary)',

        '&:hover': {
          '&:not(:disabled)': {
            '--color': 'var(--text-primary)',
            '--shadow': 'var(--shadow-hover-primary)',
          },
        },

        '&:focus-visible': {
          '--color': 'var(--text-primary)',
          '--shadow': 'var(--shadow-hover-primary)',
        },
      },
      tertiary: {
        '--border-color': 'transparent',
        '--button-background': 'transparent',

        '&:hover': {
          '&:not(:disabled)': {
            '--button-background': glassMaterialPrimitives['background-color'],
            '--color': 'var(--text-primary)',
          },
        },

        '&:focus-visible': {
          '--button-background': glassMaterialPrimitives['background-color'],
          '--color': 'var(--text-primary)',
        },
      },
    },

    rounded: {
      true: {
        borderRadius: '9999px',

        '&::after': {
          borderRadius: '9999px',
        },
      },
      false: {},
    },

    size: {
      small: {
        width: '30px',
        height: '30px',

        // --space-4
        '& svg': {
          width: '16px',
          height: '16px',
        },
      },

      large: {
        width: '34px',
        height: '34px',

        '& svg': {
          width: '18px',
          height: '18px',
        },
      },
    },
  },

  defaultVariants: {
    size: 'large',
    variant: 'secondary',
  },
});
