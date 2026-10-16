// Layer a soft reflection over the existing glass border without changing its fill.
export const glassBorderShine = {
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: 'var(--thickness, 1.5px)',
    background:
      'radial-gradient(ellipse 85% 100% at 50% 0%, oklch(from var(--text-primary) l c h / var(--glass-border-highlight, 36%)), oklch(from var(--text-primary) l c h / 5%) 45%, transparent 85%), var(--glass-border-base, transparent)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    zIndex: 1,
  },
};
