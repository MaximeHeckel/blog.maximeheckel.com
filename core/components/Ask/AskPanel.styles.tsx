import { IconButton, styled } from '@maximeheckel/design-system';

export const Composer = styled('form', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  // Window radius (22px) minus its footer inset (12px).
  borderRadius: 10,
  background:
    'linear-gradient(oklch(100% 0 0 / 4%), transparent), oklch(from var(--gray-300) calc(l + 0.035) c h)',
  border: '1px solid oklch(from var(--text-primary) l c h / 8%)',
  borderTopColor: 'oklch(from var(--gray-300) calc(l + 0.12) c h)',
  boxShadow:
    '0 2px 2px oklch(0% 0 0 / 12%), 0 8px 20px -6px oklch(0% 0 0 / 24%)',
});

// Keep the design-system textarea's typography and native input behavior,
// with the shared composer surface providing its elevation.
export const ComposerInput = styled('textarea', {
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 58,
  maxHeight: 164,
  fieldSizing: 'content',
  overflowY: 'auto',
  margin: 0,
  padding: 'var(--space-2) var(--space-3)',
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
  margin: '0 var(--space-3) var(--space-3) 0',
  background: 'oklch(from var(--text-primary) l c h / 8%)',
});

export const Content = styled('div', {
  fontSize: 'var(--font-size-1)',
  lineHeight: 1.7,
  '> blockquote': {
    boxSizing: 'border-box',
    width: 'fit-content',
    maxWidth: '85%',
    margin: '0 0 var(--space-5) auto',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--border-radius-2)',
    background: 'oklch(from var(--gray-200) calc(l + 0.035) c h)',
    border: '1px solid oklch(from var(--text-primary) l c h / 5%)',
    boxShadow: '0 3px 8px -2px oklch(0% 0 0 / 18%)',
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
  gap: 'var(--space-0)',
  flex: 1,
  padding: 'var(--space-4) 0',
  textAlign: 'center',
  '> p': { margin: 0, maxWidth: '34ch' },
});
