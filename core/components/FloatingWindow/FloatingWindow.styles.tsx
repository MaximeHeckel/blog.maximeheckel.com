import { Card, styled } from '@maximeheckel/design-system';

export const Window = styled(Card, {
  '--window-radius': 'var(--space-5)',
  '--window-footer-inset': 'var(--space-3)',
  '--window-inset':
    'max(var(--space-2), env(safe-area-inset-top), env(safe-area-inset-right), env(safe-area-inset-bottom), env(safe-area-inset-left))',
  '--window-width': 'min(420px, calc(100vw - 2 * var(--window-inset)))',
  '--window-height':
    'min(max(420px, var(--resized-window-height, 50dvh)), calc(var(--visible-viewport-height, 100dvh) - 2 * var(--window-inset)))',
  width: 'var(--window-width)',
  height: 'var(--window-height)',
  borderRadius: 'var(--window-radius)',
  position: 'fixed',
  right: 'var(--window-inset)',
  bottom: 'calc(var(--window-inset) + var(--viewport-offset-bottom, 0px))',
  '&[data-corner$="left"]': {
    left: 'var(--window-inset)',
    right: 'auto',
  },
  '&[data-corner^="top"]': {
    top: 'calc(var(--window-inset) + var(--viewport-offset-top, 0px))',
    bottom: 'auto',
  },
  zIndex: 101,
  overflow: 'hidden',
  isolation: 'isolate',
  transformOrigin: 'top left',
  boxSizing: 'border-box',
  color: 'var(--text-primary)',
  border: '1px solid transparent !important',
  boxShadow:
    '0 24px 64px -12px oklch(0% 0 0 / 40%), 0 4px 12px oklch(0% 0 0 / 16%)',
  // The callout's masked border, with a neutral highlight along the top rim.
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: '1px',
    background:
      'radial-gradient(ellipse 90% 80% at 50% 0%, oklch(from var(--text-primary) l c h / 18%), oklch(from var(--text-primary) l c h / 4.5%) 55%, transparent 100%), var(--border-color)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    zIndex: 5,
  },
  '@media (max-width: 600px)': {
    '--window-width': 'calc(100vw - 2 * var(--window-inset))',
  },
  backgroundColor: 'var(--background)',
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
  padding: 'var(--space-4) var(--space-4) var(--space-3) var(--space-5)',
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
  padding: 'var(--space-4) var(--space-5)',
  overflowWrap: 'anywhere',
  maskImage:
    'linear-gradient(to bottom, transparent, rgb(0 0 0 / 35%) 6px, #000 var(--space-4), #000 calc(100% - var(--space-6)), rgb(0 0 0 / 35%) calc(100% - 12px), transparent)',
});

export const Footer = styled('div', {
  padding: '0 var(--window-footer-inset) var(--window-footer-inset)',
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
  '@media (pointer: coarse)': {
    left: '50%',
    right: 'auto',
    width: 96,
    height: 44,
    transform: 'translateX(-50%)',
    '&[data-edge="top"]': { top: 0 },
    '&::after': { position: 'absolute', top: 9 },
    '&[data-edge="bottom"]::after': { top: 'auto', bottom: 9 },
  },
  '&:hover::after, &:focus-visible::after': { opacity: 1 },
  '&:focus-visible': {
    outline: '2px solid var(--accent)',
    borderRadius: 'var(--border-radius-0)',
  },
});
