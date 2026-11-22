import { styled } from 'lib/stitches.config';

export const StyledPill = styled('span', {
  display: 'inline-flex !important',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px 8px !important',
  minWidth: '40px',
  height: '28px',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-500)',
  cursor: 'default',
  userSelect: 'none',
  borderRadius: 'var(--border-radius-1)',

  background: 'var(--pill-background)',
  color: 'var(--pill-color)',

  variants: {
    dark: {
      true: {},
    },
    variant: {
      info: {
        '--pill-background': 'var(--emphasis)',
        '--pill-color': 'var(--accent)',
      },
      success: {
        '--pill-background': 'var(--success-emphasis)',
        '--pill-color': 'var(--success)',
      },
      warning: {
        '--pill-background': 'var(--warning-emphasis)',
        '--pill-color': 'var(--warning)',
      },
      danger: {
        '--pill-background': 'var(--danger-emphasis)',
        '--pill-color': 'var(--danger)',
      },
    },
  },
});
