import { styled } from '@maximeheckel/design-system';

const Flex = styled('div', {
  display: 'flex',

  variants: {
    alignItems: {
      baseline: {
        alignItems: 'baseline',
      },
      center: {
        alignItems: 'center',
      },
      end: {
        alignItems: 'end',
      },
      ['flex-end']: {
        alignItems: 'flex-end',
      },
      ['flex-start']: {
        alignItems: 'flex-start',
      },
      start: {
        alignItems: 'start',
      },
      stretch: {
        alignItems: 'stretch',
      },
    },
    alignContent: {
      baseline: {
        alignContent: 'baseline',
      },
      center: {
        alignContent: 'center',
      },
      end: {
        alignContent: 'end',
      },
      start: {
        alignContent: 'start',
      },
      stretch: {
        alignContent: 'stretch',
      },
    },
    direction: {
      column: {
        flexDirection: 'column',
      },
      columnReverse: {
        flexDirection: 'column-reverse',
      },
      row: {
        flexDirection: 'row',
      },
      rowReverse: {
        flexDirection: 'row-reverse',
      },
    },
    gap: {
      1: {
        gap: 'var(--space-1)',
      },
      2: {
        gap: 'var(--space-2)',
      },
      3: {
        gap: 'var(--space-3)',
      },
      4: {
        gap: 'var(--space-4)',
      },
      5: {
        gap: 'var(--space-5)',
      },
      6: {
        gap: 'var(--space-6)',
      },
      7: {
        gap: 'var(--space-7)',
      },
      8: {
        gap: 'var(--space-8)',
      },
      9: {
        gap: 'var(--space-9)',
      },
      10: {
        gap: 'var(--space-10)',
      },
      11: {
        gap: 'var(--space-11)',
      },
      12: {
        gap: 'var(--space-12)',
      },
      13: {
        gap: 'var(--space-13)',
      },
      14: {
        gap: 'var(--space-14)',
      },
      15: {
        gap: 'var(--space-15)',
      },
    },
    justifyContent: {
      center: {
        justifyContent: 'center',
      },
      end: {
        justifyContent: 'end',
      },
      ['space-around']: {
        justifyContent: 'space-around',
      },
      ['space-between']: {
        justifyContent: 'space-between',
      },
      ['space-evenly']: {
        justifyContent: 'space-evenly',
      },
      start: {
        justifyContent: 'start',
      },
    },
    wrap: {
      wrap: {
        flexWrap: 'wrap',
      },
      nowrap: {
        flexWrap: 'nowrap',
      },
    },
  },
  defaultVariants: {
    gap: 1,
    wrap: 'nowrap',
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export { Flex };
