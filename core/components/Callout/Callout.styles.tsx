import { styled } from '@maximeheckel/design-system';

export const StyledCalloutIconWrapper = styled('span', {
  display: 'inline-flex',
  flexShrink: 0,
});

export const StyledCalloutHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  marginBottom: 'var(--space-3)',
  color: 'var(--callout-accent)',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-500)',
  lineHeight: 1.5,
});

export const StyledCallout = styled('aside', {
  '--callout-accent': 'var(--accent)',
  '--callout-gradient-shape': 'ellipse 85% 150% at 0% 0%',
  '--callout-padding': 'var(--space-4)',
  '--code-block-bleed': '0px',
  // Keep nested code corners rounded even when the inset exceeds our radius.
  '--code-block-radius':
    'max(6px, calc(var(--border-radius-2) - var(--callout-padding) - 1px))',
  position: 'relative',
  isolation: 'isolate',
  padding: 'var(--callout-padding)',
  borderRadius: 'var(--border-radius-2)',
  color: 'var(--text-primary)',
  border: '1px solid transparent',
  background:
    'radial-gradient(var(--callout-gradient-shape), oklch(from var(--callout-accent) l c h / 0.07), oklch(from var(--callout-accent) l c h / 0.025) 40%, transparent 75%)',

  // Fade the accent over a solid border color so the edge never fades away.
  // Mask out the center so the border can fade independently of the fill.
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',
    background:
      'radial-gradient(var(--callout-gradient-shape), oklch(from var(--callout-accent) l c h / 0.4), oklch(from var(--callout-accent) l c h / 0.1) 40%, oklch(from var(--callout-accent) l c h / 0) 75%), var(--border-color)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },

  // Fade the stripes along the same ellipse as the fill and border.
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background:
      'repeating-linear-gradient(135deg, oklch(from var(--callout-accent) l c h / 0.08) 0px 1px, transparent 1px 6px)',
    maskImage:
      'radial-gradient(var(--callout-gradient-shape), #fff, transparent 75%)',
    pointerEvents: 'none',
  },

  '& > *': {
    position: 'relative',
    zIndex: 1,
  },

  variants: {
    variant: {
      info: {
        '--callout-accent': 'var(--accent)',
      },
      danger: {
        '--callout-accent': 'var(--danger)',
      },
      warning: {
        '--callout-accent': 'var(--warning)',
      },
    },
  },
});
