import { styled } from 'lib/stitches.config';

import { glassMaterialPrimitives } from '../GlassMaterial';
import { buttonRecipe } from './Button.recipe';

export const StyledButton = styled('button', {
  ...buttonRecipe.base,
  variants: buttonRecipe.variants,
  compoundVariants: buttonRecipe.compoundVariants,
});

export const StyledIconButton = styled('button', {
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
