import { styled } from 'lib/stitches.config';

export const StyledSwitch = styled('input', {
  WebkitAppearance: 'none',
  MozAppearance: 'none',

  flexShrink: 0,

  height: '24px',
  width: '44px',

  outline: 'none',
  display: 'inline-block',
  position: 'relative',
  margin: 0,
  cursor: 'pointer',

  borderRadius: 'var(--border-radius-2)',
  border: '1px solid var(--border-color, var(--input-border))',
  background: 'var(--background, var(--input-background))',
  boxShadow: 'var(--shadow, none)',
  transition: 'background 0.3s, border-color 0.3s, box-shadow 0.2s',

  '--shadow-hover-primary': '0 2px 20px 3px var(--input-focus)',

  '&:after': {
    content: '',
    display: 'block',
    position: 'absolute',
    left: '2px',
    top: '2px',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    background: 'var(--ab, var(--input-border))',
    boxShadow: 'var(--shadow-handle, none)',
    transition:
      'transform var(--d-t, 0.3s) var(--d-t-e, ease), opacity var(--d-o, 0.2s), box-shadow 0.2s',
    transform: 'translateX(var(--x, 0))',
  },

  '&:checked': {
    '--background': 'var(--input-active)',
    '--border-color': 'var(--input-active)',
    '--d-o': '0.3s',
    '--d-t': '0.6s',
    '--d-t-e': 'cubic-bezier(0.2, 0.85, 0.32, 1.2)',
    '--ab': '#ffffff',
    '--x': '20px',
    '--shadow-handle':
      'inset 0px 1px 1px rgba(255, 255, 255, 0.3), inset 0px -1.0px 0.5px rgba(0, 0, 0, 0.3)',
  },

  '&:disabled': {
    '--background': 'var(--input-disabled)',
    cursor: 'not-allowed',
    opacity: '0.4',
    filter: 'grayscale(0.25)',
    '&:checked': {
      '--border-color': 'var(--input-border)',
    },
    '& + label': {
      cursor: 'not-allowed',
    },
    '&:not(:checked)': {
      '&:after': {
        opacity: '0.6',
      },
    },
  },

  '&:hover': {
    '&:not(:disabled)': {
      '&:not(:checked)': {
        '--border-color': 'var(--input-active)',
      },
      '--shadow': 'var(--shadow-hover-primary)',
    },
  },

  '&:focus-visible': {
    '--border-color': 'var(--input-active)',
    '--shadow': 'var(--shadow-hover-primary)',
  },
});
