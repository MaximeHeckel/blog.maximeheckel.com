import { withAs } from 'lib/panda';
import { styled } from 'styled-system/jsx';
import type { StyledVariantProps as VariantProps } from 'styled-system/jsx';

export const StyledSVG = withAs(
  styled('svg', {
    variants: {
      variant: {
        default: { stroke: 'currentColor', fill: 'none' },
        primary: {
          stroke: 'var(--text-primary)',
          fill: 'none',
        },
        secondary: {
          stroke: 'var(--text-secondary)',
          fill: 'none',
        },
        tertiary: {
          stroke: 'var(--text-tertiary)',
          fill: 'none',
        },
        info: {
          stroke: 'var(--accent)',
          fill: 'var(--emphasis)',
        },
        danger: {
          stroke: 'var(--danger)',
          fill: 'var(--danger-emphasis)',
        },
        success: {
          stroke: 'var(--success)',
          fill: 'var(--success-emphasis)',
        },
        warning: {
          stroke: 'var(--warning)',
          fill: 'var(--warning-emphasis)',
        },
      },
      outline: {
        true: {
          fill: 'none !important',
        },
      },
      size: {
        ['1']: {
          width: 'var(--space-2)',
          height: 'var(--space-2)',
        },
        ['2']: {
          width: 'var(--space-3)',
          height: 'var(--space-3)',
        },
        ['3']: {
          width: 'var(--space-4)',
          height: 'var(--space-4)',
        },
        ['4']: {
          width: '20px',
          height: '20px',
        },
        ['5']: {
          width: 'var(--space-5)',
          height: 'var(--space-5)',
        },
        ['6']: {
          width: 'var(--space-6)',
          height: 'var(--space-6)',
        },
        ['7']: {
          width: 'var(--space-7)',
          height: 'var(--space-7)',
        },
        ['8']: {
          width: 'var(--space-8)',
          height: 'var(--space-8)',
        },
        ['9']: {
          width: 'var(--space-9)',
          height: 'var(--space-9)',
        },
        ['10']: {
          width: 'var(--space-10)',
          height: 'var(--space-10)',
        },
        ['11']: {
          width: 'var(--space-11)',
          height: 'var(--space-11)',
        },
        ['12']: {
          width: 'var(--space-12)',
          height: 'var(--space-12)',
        },
        ['13']: {
          width: 'var(--space-13)',
          height: 'var(--space-13)',
        },
        ['14']: {
          width: 'var(--space-14)',
          height: 'var(--space-14)',
        },
        ['15']: {
          width: 'var(--space-15)',
          height: 'var(--space-15)',
        },
      },
    },
    defaultVariants: {
      variant: 'default',
      outline: true,
      size: '5',
    },
  })
);

export type IconSize = VariantProps<typeof StyledSVG>['size'];
export type IconVariant = VariantProps<typeof StyledSVG>['variant'];
