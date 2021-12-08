import { styled } from 'lib/stitches.config';

const DEFAULT_TAG = 'div';

export const CardWrapper = styled(DEFAULT_TAG, {
  position: 'relative',
  background:
    'var(--card-background, var(--maximeheckel-card-background-color))',
  backdropFilter: 'var(--card-blur, none)',
  borderRadius: 'var(--border-radius-2)',
  boxShadow: 'var(--card-shadow, var(--maximeheckel-shadow-1))',
  border: '1px solid var(--maximeheckel-border-color)',
  overflow: 'hidden',

  variants: {
    glass: {
      true: {
        '--card-background': 'var(--maximeheckel-colors-foreground)',
        '--card-blur': 'blur(6px)',
      },
    },
    depth: {
      0: {
        '--card-shadow': 'var(--maximeheckel-shadow-0)',
      },
      1: {
        '--card-shadow': 'var(--maximeheckel-shadow-1)',
      },
      2: {
        '--card-shadow': 'var(--maximeheckel-shadow-2)',
      },
      3: {
        '--card-shadow': 'var(--maximeheckel-shadow-3)',
      },
    },
  },
});

export const CardHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopLeftRadius: 'var(--border-radius-1)',
  borderTopRightRadius: 'var(--border-radius-1)',
  minHeight: '50px',
  padding: '0px 24px',
  color: 'var(--maximeheckel-colors-typeface-tertiary)',
  fontWeight: 500,
  fontSize: 'var(--font-size-2)',
  borderBottom: '1px solid var(--maximeheckel-border-color)',
});

CardHeader.displayName = 'CardHeader';

export const CardBody = styled('div', {
  overflow: 'hidden',
  padding: '36px 24px',
  position: 'relative',
});
