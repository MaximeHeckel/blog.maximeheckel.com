import { glassMaterialPrimitives } from '../GlassMaterial';

export const buttonRecipe = {
  base: {
    WebkitAppearance: 'none',
    WebkitTapHighlightColor: 'transparent',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    MsUserSelect: 'none',
    userSelect: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: '0',
    outline: 'none',
    cursor: 'pointer',
    border: '0',
    font: 'inherit',
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
  } as const,
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
  } as const,

  compoundVariants: [
    {
      variant: 'primary' as const,
      inverted: true as const,
      css: {
        '--button-background': 'var(--text-primary)',
        '--color': 'var(--background)',
      },
    },
    {
      variant: 'secondary' as const,
      inverted: true as const,
      css: {},
    },
  ],
};
