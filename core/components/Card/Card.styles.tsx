import { Shadows, styled } from 'lib/stitches.config';

import Box from '../Box';
import { glassMaterialPrimitives } from '../GlassMaterial';

export const CardWrapper = styled(Box, {
  position: 'relative',
  background: 'var(--card-bg, var(--card-background))',
  backdropFilter: 'var(--card-blur, none)',
  borderRadius: 'var(--border-radius-2)',
  boxShadow: 'var(--card-shadow)',
  overflow: 'hidden',
  '--border': '1px solid var(--border-color)',
  border: 'var(--border)',

  variants: {
    depth: {
      0: {
        '--card-shadow': Shadows[0],
      },
      1: {
        '--card-shadow': Shadows[1],
      },
      2: {
        '--card-shadow': Shadows[2],
      },
      3: {
        '--card-shadow': Shadows[3],
      },
    },
    variant: {
      primary: {
        '--card-bg': 'var(--card-background)',
      },
      secondary: {
        '--card-bg': glassMaterialPrimitives['background-color'],
        '--border': glassMaterialPrimitives.border,
      },
      tertiary: {
        '--card-bg': 'transparent',
      },
    },
  },
  defaultVariants: {
    depth: 1,
  },
});

export const CardHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopLeftRadius: 'var(--border-radius-1)',
  borderTopRightRadius: 'var(--border-radius-1)',
  padding: '12px 12px',
  color: 'var(--text-tertiary)',
  fontWeight: 500,
  fontSize: 'var(--font-size-1)',
  borderBottom: 'var(--border)',
});

CardHeader.displayName = 'CardHeader';

export const CardBody = styled('div', {
  overflow: 'hidden',
  padding: '16px 16px',
  position: 'relative',

  variants: {
    dotMatrix: {
      true: {
        backgroundImage:
          'radial-gradient(oklch( from var(--border-color) l c h / 54%) 1px, transparent 0)',
        backgroundPosition: 'center center',
        backgroundSize: '12px 12px',
      },
    },
  },
});
