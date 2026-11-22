import { styled } from 'styled-system/jsx';

export const StyledRadio = styled('input', {
  base: {
    WebkitAppearance: 'none',

    flexShrink: 0,

    height: '24px',
    width: '24px',

    outline: 'none',
    display: 'inline-block',
    position: 'relative',
    margin: 0,
    cursor: 'pointer',

    // TODO: Custom token "round"?
    borderRadius: '50%',
    border: '1px solid var(--border-color, var(--input-border))',
    background: 'var(--background, var(--input-background))',
    boxShadow: 'var(--shadow, none)',
    transition: 'background 0.3s, border-color 0.3s, box-shadow 0.2s',

    '--shadow-hover-primary': '0 2px 20px 3px var(--input-focus)',

    '&:after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: 0,
      top: 0,
      transition:
        'transform var(--d-t, 0.3s) var(--d-t-e, ease), opacity var(--d-o, 0.2s)',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      background: 'var(--input-background)',
      opacity: 'var(--opacity, 0)',
      transform: 'scale(var(--scale, 0.7))',
    },

    '&:checked': {
      '--background': 'var(--input-active)',
      '--border-color': 'var(--input-active)',
      '--d-o': '0.3s',
      '--d-t': '0.6s',
      '--d-t-e': 'cubic-bezier(0.2, 0.85, 0.32, 1.2)',
      '--scale': '0.5',
      '--opacity': '1',
    },

    '&:disabled': {
      '--background': 'var(--input-disabled)',
      cursor: 'not-allowed',
      opacity: 0.4,
      filter: 'grayscale(0.25)',
      '&:checked': {
        '--background': 'var(--input-disabled)',
        '--border-color': 'var(--input-border)',
      },
      '& + label': {
        cursor: 'not-allowed',
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
  },
});
