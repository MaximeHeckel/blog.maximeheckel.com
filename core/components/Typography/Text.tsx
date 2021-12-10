import { styled } from 'lib/stitches.config';
import React from 'react';
import { EMProps, StrongProps } from './types';

/**
 * lineheight
 * 1.9 p li
 *
 * 1.6818 h1 h2 h3
 *
 * 1.45 // Inline code
 * 1.5 // Image ToC Search Result
 *
 * 1.625 // Text Area Text Input
 */

const Text = styled('span', {
  margin: '0 0 2.25rem 0',
  padding: 0,
  textRendering: 'optimizeLegibility',

  variants: {
    // add truncate variant
    // line heights (define token)
    // composed variant => gradient = true => variant = default ?
    spaced: {
      true: {
        letterSpacing: '0.3px',
        lineHeight: 1.9,
      },
    },
    size: {
      1: {
        fontSize: 'var(--font-size-1)',
      },
      2: {
        fontSize: 'var(--font-size-2)',
      },
      3: {
        fontSize: 'var(--font-size-3)',
      },
      4: {
        fontSize: 'var(--font-size-4)',
      },
      5: {
        fontSize: 'var(--font-size-5)',
      },
      6: {
        fontSize: 'var(--font-size-6)',
      },
      7: {
        fontSize: 'var(--font-size-7)',
      },
    },
    variant: {
      default: { color: 'currentColor' },
      primary: { color: 'var(--maximeheckel-colors-typeface-primary)' },
      secondary: { color: 'var(--maximeheckel-colors-typeface-secondary)' },
      tertiary: { color: 'var(--maximeheckel-colors-typeface-tertiary)' },
      info: { color: 'var(--maximeheckel-colors-brand)' },
      success: { color: 'var(--maximeheckel-colors-success)' },
      warning: { color: 'var(--maximeheckel-colors-warning)' },
      danger: { color: 'var(--maximeheckel-colors-danger)' },
    },
    weight: {
      1: {
        fontWeight: 'var(--font-weight-1)',
      },
      2: {
        fontWeight: 'var(--font-weight-2)',
      },
      3: {
        fontWeight: 'var(--font-weight-3)',
      },
      4: {
        fontWeight: 'var(--font-weight-4)',
      },
    },
    gradient: {
      true: {
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    },
  },
  defaultVariants: {
    size: '3',
    variant: 'default',
    weight: '2',
    spaced: true,
  },
});

const EM = React.forwardRef<React.ElementRef<'em'>, EMProps>((props, ref) => {
  return <Text {...props} as="em" variant="primary" weight="3" ref={ref} />;
});

EM.displayName = 'EM';

const Strong = React.forwardRef<React.ElementRef<'strong'>, StrongProps>(
  (props, ref) => {
    return (
      <Text {...props} as="strong" variant="primary" weight="4" ref={ref} />
    );
  }
);

Strong.displayName = 'Strong';

export default Text;
export { EM, Strong };
