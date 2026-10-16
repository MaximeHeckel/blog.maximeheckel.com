import { IconButton, styled } from '@maximeheckel/design-system';

// Keep the inset surfaces in the same family as the callout's gradient border.
const insetSurfaceBorder = {
  border: '1px solid transparent',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',
    background:
      'radial-gradient(ellipse 90% 100% at 50% 0%, oklch(from var(--text-primary) l c h / 12%), oklch(from var(--text-primary) l c h / 2.25%) 65%, transparent 100%), var(--border-color)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
};

export const ComposerSurface = styled('div', {
  '--composer-surface-radius':
    'calc(var(--window-radius) - var(--window-footer-inset))',
  '--composer-surface-inset': 'var(--space-1)',
  position: 'relative',
  // Reserve the surface inset even when there is no attached context.
  padding: 'var(--composer-surface-inset)',
  border: '1px solid transparent',
  borderRadius: 'var(--composer-surface-radius)',
  variants: {
    attached: {
      true: {
        background: 'var(--card-background)',
        borderColor: 'var(--border-color)',
      },
    },
  },
});

export const ComposerAttachments = styled('div', {
  padding: 'var(--space-1) var(--space-2) var(--space-2)',
  maxHeight: 120,
  overflowY: 'auto',
});

export const Composer = styled('form', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--space-1) var(--space-2)',
  borderRadius:
    'calc(var(--composer-surface-radius) - var(--composer-surface-inset) - 1px)',
  background:
    'linear-gradient(oklch(from var(--text-primary) l c h / 3%), transparent), var(--card-background)',
  ...insetSurfaceBorder,
  boxShadow:
    '0 2px 2px oklch(0% 0 0 / 8%), 0 8px 20px -6px oklch(0% 0 0 / 20%)',
  '&:focus-within::before': {
    background:
      'radial-gradient(ellipse 90% 100% at 50% 0%, oklch(from var(--text-primary) l c h / 18%), oklch(from var(--text-primary) l c h / 3.75%) 65%, transparent 100%), var(--border-color)',
  },
});

// Keep the design-system textarea's typography and native input behavior,
// with the shared composer surface providing its elevation.
export const ComposerInput = styled('textarea', {
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 'calc(var(--space-6) + var(--space-4))',
  maxHeight: 164,
  fieldSizing: 'content',
  overflowY: 'auto',
  margin: 0,
  padding: 'var(--space-1)',
  resize: 'none',
  border: 'none',
  borderRadius: 'inherit',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  fontFeatureSettings: 'inherit',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-400)',
  letterSpacing: '0.15px',
  lineHeight: '26px',
  color: 'var(--text-primary)',
  '&::placeholder': { color: 'var(--text-tertiary)', opacity: 0.8 },
  '&:disabled': { cursor: 'not-allowed', opacity: 0.4 },
  '@media (max-width: 600px)': { fontSize: 16 },
});

export const SendButton = styled(IconButton, {
  borderRadius: '50%',
  alignSelf: 'flex-end',
  flexShrink: 0,
  margin: 0,
  background: 'oklch(from var(--text-primary) l c h / 8%)',
});

export const Content = styled('div', {
  fontSize: 'var(--font-size-1)',
  lineHeight: 1.7,
  '> blockquote': {
    position: 'relative',
    boxSizing: 'border-box',
    width: 'fit-content',
    maxWidth: '85%',
    margin: '0 0 var(--space-5) auto',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--border-radius-2)',
    background: 'oklch(from var(--card-background) calc(l + 0.035) c h)',
    ...insetSurfaceBorder,
    boxShadow: '0 3px 8px -2px oklch(0% 0 0 / 12%)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    textAlign: 'left',
  },
  a: {
    color: 'var(--text-primary)',
    borderColor: 'transparent',
    '&:hover, &:focus-visible': { borderColor: 'var(--text-primary)' },
  },
});

export const EmptyState = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-3)',
  flex: 1,
  padding: 'var(--space-4) 0',
  textAlign: 'center',
  '> p': { margin: 0, maxWidth: '34ch' },
});
