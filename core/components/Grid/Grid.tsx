import { styled } from 'lib/stitches.config';

const Grid = styled('div', {
  display: 'grid',
  height: 'inherit',
  variants: {
    align: {
      start: {
        alignItems: 'start',
      },
      center: {
        alignItems: 'center',
      },
      end: {
        alignItems: 'end',
      },
      stretch: {
        alignItems: 'stretch',
      },
      baseline: {
        alignItems: 'baseline',
      },
    },
    justify: {
      start: {
        justifyContent: 'start',
      },
      center: {
        justifyContent: 'center',
      },
      end: {
        justifyContent: 'end',
      },
      between: {
        justifyContent: 'space-between',
      },
    },
    flow: {
      row: {
        gridAutoFlow: 'row',
      },
      column: {
        gridAutoFlow: 'column',
      },
      dense: {
        gridAutoFlow: 'dense',
      },
      rowDense: {
        gridAutoFlow: 'row dense',
      },
      columnDense: {
        gridAutoFlow: 'column dense',
      },
    },
    columns: {
      1: {
        gridTemplateColumns: 'repeat(1, 1fr)',
      },
      2: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      3: {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      4: {
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
      small: {
        gridTemplateColumns: 'var(--layout-small)',
      },
      medium: {
        gridTemplateColumns: 'var(--layout-medium)',
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
    gapX: {
      1: {
        columnGap: 'var(--space-1)',
      },
      2: {
        columnGap: 'var(--space-2)',
      },
      3: {
        columnGap: 'var(--space-3)',
      },
      4: {
        columnGap: 'var(--space-4)',
      },
      5: {
        columnGap: 'var(--space-5)',
      },
      6: {
        columnGap: 'var(--space-6)',
      },
      7: {
        columnGap: 'var(--space-7)',
      },
      8: {
        columnGap: 'var(--space-8)',
      },
      9: {
        columnGap: 'var(--space-9)',
      },
      10: {
        columnGap: 'var(--space-10)',
      },
      11: {
        columnGap: 'var(--space-11)',
      },
      12: {
        columnGap: 'var(--space-12)',
      },
      13: {
        columnGap: 'var(--space-13)',
      },
      14: {
        columnGap: 'var(--space-14)',
      },
      15: {
        columnGap: 'var(--space-15)',
      },
    },
    gapY: {
      1: {
        rowGap: 'var(--space-1)',
      },
      2: {
        rowGap: 'var(--space-2)',
      },
      3: {
        rowGap: 'var(--space-3)',
      },
      4: {
        rowGap: 'var(--space-4)',
      },
      5: {
        rowGap: 'var(--space-5)',
      },
      6: {
        rowGap: 'var(--space-6)',
      },
      7: {
        rowGap: 'var(--space-7)',
      },
      8: {
        rowGap: 'var(--space-8)',
      },
      9: {
        rowGap: 'var(--space-9)',
      },
      10: {
        rowGap: 'var(--space-10)',
      },
      11: {
        rowGap: 'var(--space-11)',
      },
      12: {
        rowGap: 'var(--space-12)',
      },
      13: {
        rowGap: 'var(--space-13)',
      },
      14: {
        rowGap: 'var(--space-14)',
      },
      15: {
        rowGap: 'var(--space-15)',
      },
    },
  },
  defaultVariants: {
    align: 'stretch',
    justify: 'initial',
  },
});

export default Grid;
