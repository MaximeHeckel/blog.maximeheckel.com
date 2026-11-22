import { styled } from 'lib/stitches.config';

import Box from '../Box';

const GridItem = styled(Box, {
  position: 'relative',
  variants: {
    alignSelf: {
      start: {
        alignSelf: 'start',
      },
      center: {
        alignSelf: 'center',
      },
      end: {
        alignSelf: 'end',
      },
      stretch: {
        alignSelf: 'stretch',
      },
      baseline: {
        alignSelf: 'baseline',
      },
    },
    justifySelf: {
      start: {
        justifySelf: 'start',
      },
      center: {
        justifySelf: 'center',
      },
      end: {
        justifySelf: 'end',
      },
      stretch: {
        justifySelf: 'stretch',
      },
      baseline: {
        justifySelf: 'baseline',
      },
    },
    placeSelf: {
      start: {
        placeSelf: 'start',
      },
      center: {
        placeSelf: 'center',
      },
      end: {
        placeSelf: 'end',
      },
      stretch: {
        placeSelf: 'stretch',
      },
      baseline: {
        placeSelf: 'baseline',
      },
    },
  },
});

const Grid = styled(Box, {
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

export { Grid, GridItem };
