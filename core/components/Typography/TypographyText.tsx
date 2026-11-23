import { withAs } from 'lib/panda';
import { styled } from 'styled-system/jsx';

import { EMProps, StrongProps } from './Typography.types';

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

const Text = withAs(
  styled('span', {
    base: {
      margin: 0,
      padding: 0,
      textRendering: 'optimizeLegibility',
    },

    variants: {
      // line heights / leading (define token)
      // rename space to tracking (define token)
      // composed variant => gradient = true => variant = default ?
      // Follow dynamic metrics https://rsms.me/inter/dynmetrics/
      outline: {
        true: {
          color: 'transparent !important',
          WebkitTextStrokeColor: 'var(--text-primary)',
          WebkitTextStrokeWidth: '1px',
        },
      },
      spaced: {
        true: {
          letterSpacing: '0.3px',
          lineHeight: 1.75,
        },
      },
      family: {
        default: {
          fontFamily: 'inherit',
        },
        display: {
          fontFamily: 'var(--font-display)',
        },
        serif: {
          fontFamily: 'var(--font-serif)',
        },
        mono: {
          fontFamily: 'var(--font-mono)',
        },
        code: {
          fontFamily: 'var(--font-mono-code)',
        },
      },
      size: {
        ['1']: {
          fontSize: 'var(--font-size-1)',
        },
        ['2']: {
          fontSize: 'var(--font-size-1)',
        },
        ['3']: {
          fontSize: 'var(--font-size-3)',
        },
        ['4']: {
          fontSize: 'var(--font-size-4)',
        },
        ['5']: {
          fontSize: 'var(--font-size-5)',
        },
        ['6']: {
          fontSize: 'var(--font-size-6)',
        },
        ['7']: {
          fontSize: 'var(--font-size-7)',
        },
        '8': {
          fontSize: 'var(--font-size-8)',
        },
      },
      truncate: {
        true: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
      variant: {
        default: { color: 'currentColor' },
        primary: { color: 'var(--text-primary)' },
        secondary: { color: 'var(--text-secondary)' },
        tertiary: { color: 'var(--text-tertiary)' },
        info: { color: 'var(--accent)' },
        success: { color: 'var(--success)' },
        warning: { color: 'var(--warning)' },
        danger: { color: 'var(--danger)' },
      },
      weight: {
        ['2']: {
          fontWeight: 'var(--font-weight-400)',
        },
        ['3']: {
          fontWeight: 'var(--font-weight-500)',
        },
        ['4']: {
          fontWeight: 'var(--font-weight-600)',
        },
      },
    },
    defaultVariants: {
      family: 'default',
      size: '3',
      variant: 'default',
      weight: '2',
      spaced: true,
    },
  })
);

// TODO: Add SUP component + examples with fractions
// EXPLORE: Smart fraction component ? replace / with &fracl; ?
// http://www.meticulous.org.uk/meticulous/websolutions/coding_tests/fractions.html
// EXPLORE: Footnote component: http://microformats.org/wiki/footnotes-examples https://2ality.com/2011/12/footnotes.html

const EM = (props: EMProps) => {
  return (
    <Text
      {...props}
      as="em"
      variant="tertiary"
      weight="3"
      spaced={false}
      style={{
        letterSpacing: '-0.3px',
      }}
    />
  );
};

EM.displayName = 'EM';

const Strong = (props: StrongProps) => {
  return <Text {...props} as="strong" variant="primary" weight="3" />;
};

Strong.displayName = 'Strong';

export default Text;
export { EM, Strong };
