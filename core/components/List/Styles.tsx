import { styled } from 'lib/stitches.config';

export const StyledListItem = styled('li', {
  listStyle: 'none',
  display: 'flex',

  'span[data-list-item]': {
    paddingRight: '8px',
    transform: 'translateY(4px)',
  },
});

export const StyledList = styled('div', {
  marginLeft: '0px',
  color: 'inherit',

  variants: {
    variant: {
      unordered: {
        li: {
          // We use List.Item to render the proper style
          listStyle: 'none',
        },
      },
      ordered: {
        li: {
          counterIncrement: 'li',

          svg: {
            display: 'none',
          },

          '&:before': {
            content: "counters(li, '.') '. '",
            color: 'var(--maximeheckel-colors-brand)',
            marginRight: '8px',
          },
        },
      },
    },
  },
  defaultVariants: {
    variant: 'unordered',
  },
});
