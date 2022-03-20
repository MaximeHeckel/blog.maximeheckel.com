import { styled, VariantProps } from '@maximeheckel/design-system';

export const StyledSVG = styled('svg', {
  variants: {
    variant: {
      default: { stroke: 'currentColor', fill: 'none' },
      primary: {
        stroke: 'var(--maximeheckel-colors-typeface-primary)',
        fill: 'none',
      },
      secondary: {
        stroke: 'var(--maximeheckel-colors-typeface-secondary)',
        fill: 'none',
      },
      tertiary: {
        stroke: 'var(--maximeheckel-colors-typeface-tertiary)',
        fill: 'none',
      },
      info: {
        stroke: 'var(--maximeheckel-colors-brand)',
        fill: 'var(--maximeheckel-colors-emphasis)',
      },
      danger: {
        stroke: 'var(--maximeheckel-colors-danger)',
        fill: 'var(--maximeheckel-colors-danger-emphasis)',
      },
      success: {
        stroke: 'var(--maximeheckel-colors-success)',
        fill: 'var(--maximeheckel-colors-success-emphasis)',
      },
      warning: {
        stroke: 'var(--maximeheckel-colors-warning)',
        fill: 'var(--maximeheckel-colors-warning-emphasis)',
      },
    },
    outline: {
      true: {
        fill: 'none !important',
      },
    },
    size: {
      1: {
        width: 'var(--space-1)',
        height: 'var(--space-1)',
      },
      2: {
        width: 'var(--space-2)',
        height: 'var(--space-2)',
      },
      3: {
        width: 'var(--space-3)',
        height: 'var(--space-3)',
      },
      4: {
        width: 'var(--space-4)',
        height: 'var(--space-4)',
      },
      5: {
        width: 'var(--space-5)',
        height: 'var(--space-5)',
      },
      6: {
        width: 'var(--space-6)',
        height: 'var(--space-6)',
      },
      7: {
        width: 'var(--space-7)',
        height: 'var(--space-7)',
      },
      8: {
        width: 'var(--space-8)',
        height: 'var(--space-8)',
      },
      9: {
        width: 'var(--space-9)',
        height: 'var(--space-9)',
      },
      10: {
        width: 'var(--space-10)',
        height: 'var(--space-10)',
      },
      11: {
        width: 'var(--space-11)',
        height: 'var(--space-11)',
      },
      12: {
        width: 'var(--space-12)',
        height: 'var(--space-12)',
      },
      13: {
        width: 'var(--space-13)',
        height: 'var(--space-13)',
      },
      14: {
        width: 'var(--space-14)',
        height: 'var(--space-14)',
      },
      15: {
        width: 'var(--space-15)',
        height: 'var(--space-15)',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    outline: true,
    size: 5,
  },
});

export type IconSize = VariantProps<typeof StyledSVG>['size'];
export type IconVariant = VariantProps<typeof StyledSVG>['variant'];
