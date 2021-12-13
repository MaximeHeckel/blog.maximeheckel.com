import { styled } from 'lib/stitches.config';

export const StyledButton = styled('button', {
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
  fontSize: 'var(--font-size-2)',
  fontWeight: 'var(--font-weight-3)',
  height: '44px',
  width: 'max-content',
  padding: '11px 16px',
  transition: 'background 0.2s, transform 0.2s, color 0.2s, box-shadow 0.3s',
  borderRadius: 'var(--border-radius-1)',
  /* Computed properties */
  background: 'var(--background, white)',
  color: 'var(--color, black)',
  transform: 'scale(var(--button-scale, 1)) translateZ(0)',
  boxShadow: 'var(--shadow, none)',
  opacity: 'var(--opacity, 1)',
  '--shadow-hover-primary':
    '0 2px 40px -4px var(--maximeheckel-form-input-focus)',

  '&:active': {
    '--button-scale': '0.95',
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      primary: {
        '--background': 'var(--maximeheckel-colors-brand)',
        '--color': 'hsl(var(--palette-gray-00))',
        '&:disabled': {
          '--background': 'var(--maximeheckel-form-input-disabled)',
          '--color': 'var(--maximeheckel-colors-typeface-tertiary)',
        },

        '&:hover': {
          '&:not(:disabled)': {
            '--shadow': 'var(--shadow-hover-primary)',
          },
        },

        '&:focus-visible': {
          '--shadow': 'var(--shadow-hover-primary)',
        },
      },
      secondary: {
        '--background': 'var(--maximeheckel-colors-emphasis)',
        '--color': 'var(--maximeheckel-colors-brand)',
        '&:disabled': {
          '--background': 'var(--maximeheckel-form-input-disabled)',
          '--color': 'var(--maximeheckel-colors-typeface-tertiary)',
        },

        '&:hover': {
          '&:not(:disabled)': {
            '--shadow': 'var(--shadow-hover-primary)',
          },
        },

        '&:focus-visible': {
          '--shadow': 'var(--shadow-hover-primary)',
        },
      },
    },
  },
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
  border: '0',
  /* Constant properties */
  width: '44px',
  height: '44px',
  background: 'transparent',
  transition: 'color 0.3s ease, transform 0.3s ease',
  borderRadius: 'var(--border-radius-1)',
  color: 'var(--color, var(--maximeheckel-colors-typeface-secondary))',
  transform: 'scale(var(--button-content-scale, 1)) translateZ(0)',
  '--shadow-hover-primary':
    '0 2px 40px -4px var(--maximeheckel-form-input-focus)',

  '&::after': {
    zIndex: '0',
    position: 'absolute',
    content: "''",
    display: 'block',
    width: '100%',
    height: '100%',
    borderRadius: 'var(--corner, var(--border-radius-1))',
    transition:
      'box-shadow 0.3s ease, border-color 0.2s, background 0.3s ease,\n      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    background: 'var(--background, var(--maximeheckel-colors-foreground))',
    transform: 'scale(var(--button-background-scale, 1)) translateZ(0)',
    border:
      '2px solid var(--border-color, var(--maximeheckel-colors-foreground))',
    boxShadow: 'var(--shadow, none)',
  },

  '&:disabled': {
    cursor: 'not-allowed',
    '--background': 'var(--maximeheckel-form-input-disabled)',
    '--color': 'var(--maximeheckel-colors-typeface-tertiary)',
  },

  '&:hover': {
    '&:not(:disabled)': {
      '--border-color': 'var(--maximeheckel-colors-brand)',
      '--color': 'var(--maximeheckel-colors-brand)',
      '--corner': 'calc(var(--border-radius-1) + 2px)',
      '--button-background-scale': '0.92',
      '--shadow': 'var(--shadow-hover-primary)',
    },
  },

  '&:focus-visible': {
    '--border-color': 'var(--maximeheckel-colors-brand)',
    '--color': 'var(--maximeheckel-colors-brand)',
    '--corner': 'calc(var(--border-radius-1) + 2px)',
    '--button-background-scale': 0.92,
    '--shadow': 'var(--shadow-hover-primary)',
  },

  '&:active': {
    '--button-content-scale': '0.95',
  },
});
