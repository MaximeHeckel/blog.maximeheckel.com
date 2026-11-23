import { styled } from 'styled-system/jsx';

export const StyledAnchor = styled('a', {
  base: {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'var(--color, var(--hyperlink))',
    fontWeight: 'inherit',
    wordBreak: 'break-word',
    textDecoration: 'none',
    outline: 'none',
    transition: 'border-color 0.3s ease, color 0.3s ease',

    '--hover-color': 'var(--text-primary)',

    '&:focus': {
      '--color': 'var(--hover-color, var(--accent))',
      '--hover-translation-distance': 'var(--arrow-translation, 0)',
    },

    '@media (hover: hover) and (pointer: fine)': {
      '&:hover': {
        '--color': 'var(--hover-color, var(--accent))',
        '--hover-translation-distance': 'var(--arrow-translation, 0)',
      },
    },
  },

  variants: {
    discreet: {
      true: {
        '--color': 'var(--text-tertiary)',
      },
    },
    external: {
      true: {
        '--size': '1.4em',

        '&:after': {
          content: '""',
          display: 'inline-block',
          verticalAlign: 'middle',
          width: 'var(--size, 1.05em)',
          height: 'var(--size, 1.05em)',
          maskImage: 'var(--icon)',
          WebkitMaskRepeat: 'no-repeat',
          backgroundColor: 'currentColor',
          marginLeft: '0.18em',
          marginRight: '-0.36em',
          transform: 'translateY(2px)',
        },
      },
      false: {},
    },
    arrow: {
      left: {
        '--size': '1.1em',
        '--arrow-direction': -1,
        '--arrow-translation': '-0.25em',
        '--hover-color': 'unset',

        '&:before': {
          content: '""',
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
          content: '""',
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
        '--size': '1em',

        '&:before': {
          content: '""',
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
        borderBottom: '1px solid',
        borderColor: 'var(--anchor-border-color, transparent)',

        '--hover-color': 'unset',

        '&:focus': {
          '--anchor-border-color': 'var(--accent)',
        },

        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            '--anchor-border-color': 'var(--accent)',
          },
        },
      },
    },
  },
});
