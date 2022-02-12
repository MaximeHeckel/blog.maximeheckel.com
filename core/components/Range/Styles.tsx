import { Shadows, styled } from 'lib/stitches.config';

export const StyledRange = styled('input', {
  WebkitAppearance: 'none',
  MozAppearance: 'none',

  width: '100%',
  outline: 'none',
  position: 'relative',
  display: 'block',
  margin: 0,
  flexShrink: 0,

  background: 'transparent',

  '&::-moz-range-track': {
    MozAppearance: 'none',
    width: '100%',
    height: '4px',
    border: 'none',
    borderRadius: 'var(--border-radius-0)',
    background: 'var(--track-background, transparent)',
  },

  '&::-webkit-slider-runnable-track': {
    WebkitAppearance: 'none',
    width: '100%',
    height: '4px',
    border: 'none',
    borderRadius: 'var(--border-radius-0)',
    background: 'var(--track-background, transparent)',
  },

  '&::-moz-range-thumb': {
    MozAppearance: 'none',
    height: '24px',
    width: '24px',
    borderRadius: '50%',
    background: 'var(--maximeheckel-form-input-background)',
    border:
      '1px solid var(--border-color, var(--maximeheckel-form-input-border))',
    marginTop: '-10px',
    cursor: 'grab',
    boxShadow: `var(--shadow, ${Shadows[2]})`,
    transition: 'background 0.3s, border-color 0.3s, box-shadow 0.2s',
  },

  ' &::-webkit-slider-thumb': {
    WebkitAppearance: 'none',
    height: '24px',
    width: '24px',
    borderRadius: '50%',
    background: 'var(--maximeheckel-form-input-background)',
    border:
      '1px solid var(--border-color, var(--maximeheckel-form-input-border))',
    marginTop: '-10px',
    cursor: 'grab',
    boxShadow: `var(--shadow, ${Shadows[2]})`,
    transition: 'background 0.3s, border-color 0.3s, box-shadow 0.2s',
  },

  '&:active': {
    '&::-moz-range-thumb': {
      cursor: 'grabbing',
    },
    '&::-webkit-slider-thumb': {
      cursor: 'grabbing',
    },
  },

  '&:disabled': {
    '&::-moz-range-thumb': {
      cursor: 'not-allowed',
    },
    '&::-webkit-slider-thumb': {
      cursor: 'not-allowed',
    },
  },

  '&:hover': {
    '&:not(:disabled)': {
      '&::-moz-range-thumb': {
        '--border-color': 'var(--maximeheckel-form-input-active)',
        '--shadow': '0 2px 20px 3px var(--maximeheckel-form-input-focus)',
      },

      '  &::-webkit-slider-thumb': {
        '--border-color': 'var(--maximeheckel-form-input-active)',
        '--shadow': '0 2px 20px 3px var(--maximeheckel-form-input-focus)',
      },
    },
  },

  '&:focus-visible': {
    '&::-moz-range-thumb': {
      '--border-color': 'var(--maximeheckel-form-input-active)',
      '--shadow': '0 2px 20px 3px var(--maximeheckel-form-input-focus)',
    },

    '&::-webkit-slider-thumb': {
      '--border-color': 'var(--maximeheckel-form-input-active)',
      '--shadow': '0 2px 20px 3px var(--maximeheckel-form-input-focus)',
    },
  },
});
