import { Card, styled } from '@maximeheckel/design-system';

export const Window = styled(Card, {
  '--window-inset': 'var(--space-4)',
  '--window-width': 'min(440px, calc(100vw - 32px))',
  '--window-height':
    'min(max(420px, var(--resized-window-height, 50dvh)), calc(100dvh - 48px))',
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
  border:
    'var(--thickness, 1px) solid oklch(from var(--gray-900) l c h / 15%) !important',
  boxShadow: '0 16px 64px oklch(0% 0 0 / 18%), 0 2px 8px oklch(0% 0 0 / 8%)',
  '@media (max-width: 600px)': {
    '--window-width': 'calc(100vw - 24px)',
    '--window-inset': 'var(--space-3)',
  },
  backgroundColor: 'oklch(from var(--gray-300) l c h / 0.985)',
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

export const BodyViewport = styled('div', {
  position: 'relative',
  display: 'flex',
  flex: 1,
  minHeight: 0,
});

export const LatestOverlay = styled('div', {
  position: 'absolute',
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 2,
});

export const LatestButton = styled('button', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  padding: 0,
  borderRadius: '50%',
  border: '1px solid oklch(from var(--text-primary) l c h / 12%)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  fontSize: 'var(--font-size-1)',
  boxShadow: '0 2px 8px oklch(0% 0 0 / 12%)',
  cursor: 'pointer',
  pointerEvents: 'auto',
  '&:hover': { borderColor: 'oklch(from var(--text-primary) l c h / 25%)' },
  '&:focus-visible': { outline: '2px solid var(--accent)', outlineOffset: 2 },
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

export const ResizeHandle = styled('div', {
  position: 'absolute',
  left: 'var(--space-4)',
  right: 'var(--space-4)',
  height: 12,
  zIndex: 4,
  cursor: 'ns-resize',
  touchAction: 'none',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&[data-edge="top"]': { top: 4 },
  '&[data-edge="bottom"]': { bottom: 0 },
  '&::after': {
    content: '""',
    width: 32,
    height: 3,
    transform: 'translateY(2px)',
    borderRadius: 999,
    background: 'var(--text-tertiary)',
    opacity: 0.4,
  },
  '&:hover::after, &:focus-visible::after': { opacity: 1 },
  '&:focus-visible': {
    outline: '2px solid var(--accent)',
    borderRadius: 'var(--border-radius-0)',
  },
});
