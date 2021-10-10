import { styled } from 'lib/stitches.config';

export const StyledAnchor = styled('a', {
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'var(--color, var(--maximeheckel-colors-brand))',
  fontWeight: 500,
  wordBreak: 'break-word',
  textDecoration: 'none',
  outline: 'none',
  transition: 'border-color 0.3s ease, color 0.3s ease',

  '--hover-color': 'var(--maximeheckel-colors-typeface-primary)',

  '&:focus': {
    '--color': 'var(--hover-color, var(--maximeheckel-colors-brand))',
    '--hover-translation-distance': 'var(--arrow-translation, 0)',
  },

  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      '--color': 'var(--hover-color, var(--maximeheckel-colors-brand))',
      ' --hover-translation-distance': 'var(--arrow-translation, 0)',
    },
  },

  variants: {
    discreet: {
      true: {
        '--color': 'var(--maximeheckel-colors-typeface-tertiary)',
      },
    },
    arrow: {
      left: {
        '--size': '1.1em',
        '--arrow-direction': -1,
        '--arrow-translation': '-0.25em',
        '--hover-color': 'unset',

        '&:before': {
          content: '',
          display: 'inline-block',
          verticalAlign: 'middle',
          width: 'var(--size, 1.05em)',
          height: 'var(--size, 1.05em)',
          maskImage: 'var(--icon)',
          WebkitMaskRepeat: 'no-repeat',
          backgroundColor: 'currentColor',
          marginRight: '0.18em',
          transition: 'transform 0.4s ease',
          transform:
            'translateY(-2px) translateX(var(--hover-translation-distance, 0px)) scaleX(var(--arrow-direction, 1))',
        },
      },
      right: {
        '--size': '1.1em',
        '--arrow-direction': 1,
        '--arrow-translation': '0.25em',
        '--hover-color': 'unset',

        '&:after': {
          content: '',
          display: 'inline-block',
          verticalAlign: 'middle',
          width: 'var(--size, 1.05em)',
          height: 'var(--size, 1.05em)',
          maskImage: 'var(--icon)',
          WebkitMaskRepeat: 'no-repeat',
          backgroundColor: 'currentColor',
          marginLeft: '0.18em',
          transition: 'transform 0.4s ease',
          transform:
            'translateY(-2px) translateX(var(--hover-translation-distance, 0px)) scaleX(var(--arrow-direction, 1))',
        },
      },
    },
    favicon: {
      true: {
        '--size': '1.1em',

        '&:before': {
          content: '',
          display: 'inline-block',
          verticalAlign: 'middle',
          width: 'var(--size, 1.05em)',
          height: 'var(--size, 1.05em)',
          maskImage: 'var(--icon)',
          WebkitMaskRepeat: 'no-repeat',
          backgroundColor: 'currentColor',
          marginRight: '0.18em',
          transform: 'translateY(-2px)',
        },
      },
    },
    underline: {
      true: {
        borderBottom: '2px solid',
        borderColor: 'var(--border-color, transparent)',

        '--hover-color': 'unset',

        '&:focus': {
          '--border-color': 'hsl(var(--palette-blue-40))',
        },

        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            '--border-color': 'hsl(var(--palette-blue-40))',
          },
        },
      },
    },
  },
});
