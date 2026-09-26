import { Card, styled } from '@maximeheckel/design-system';

export const Window = styled(Card, {
  '--window-inset': 'var(--space-4)',
  '--window-width': 'min(440px, calc(100vw - 32px))',
  '--window-height': 'min(640px, calc(100dvh - 48px))',
  width: 'var(--window-width)',
  height: 'var(--window-height)',
  borderRadius: 22,
  position: 'fixed',
  right: 'max(var(--window-inset), env(safe-area-inset-right))',
  bottom: 'max(var(--window-inset), env(safe-area-inset-bottom))',
  '&[data-corner$="left"]': {
    left: 'max(var(--window-inset), env(safe-area-inset-left))',
    right: 'auto',
  },
  '&[data-corner^="top"]': {
    top: 'max(var(--window-inset), env(safe-area-inset-top))',
    bottom: 'auto',
  },
  zIndex: 101,
  overflow: 'hidden',
  isolation: 'isolate',
  transformOrigin: 'top left',
  boxSizing: 'border-box',
  color: 'var(--text-primary)',
  background: 'transparent',
  border: 'none',
  boxShadow: '0 16px 64px oklch(0% 0 0 / 18%), 0 2px 8px oklch(0% 0 0 / 8%)',
  '@media (max-width: 600px)': {
    '--window-width': 'calc(100vw - 24px)',
    '--window-height': 'min(640px, calc(100dvh - 32px))',
    '--window-inset': 'var(--space-3)',
  },
});

// Keep the content at its expanded size as the shell contracts around it.
export const Interior = styled('div', {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 'var(--window-width)',
  height: 'var(--window-height)',
  display: 'flex',
  flexDirection: 'column',
  '&:focus': { outline: 'none' },
});

export const Header = styled('header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-3) var(--space-3) var(--space-3) var(--space-4)',
  // borderBottom: '1px solid var(--border-color)',
  flexShrink: 0,
});

export const Body = styled('div', {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'none',
  padding: 'var(--space-4) var(--space-4)',
  overflowWrap: 'anywhere',
  maskImage:
    'linear-gradient(to bottom, transparent, rgb(0 0 0 / 35%) 6px, #000 var(--space-4), #000 calc(100% - var(--space-6)), rgb(0 0 0 / 35%) calc(100% - 12px), transparent)',
});

export const Footer = styled('div', {
  padding: '0 var(--space-3) var(--space-3) var(--space-3)',
  flexShrink: 0,
});
