import { Button, keyframes, styled } from '@maximeheckel/design-system';

const overlayBreakpoint = '@media (max-width: 1439px)';
const slideIn = keyframes({
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' },
});

// Wide screens make room beside the page; smaller screens overlay it.
export const Page = styled('div', {
  '--reading-panel-width': 'min(400px, 100vw)',
  '--reading-panel-space': '0px',
  position: 'relative',
  zIndex: 1,
  minHeight: '100vh',
  width: 'calc(100% - var(--reading-panel-space))',
  background: 'var(--gray-000)',
  clipPath: 'inset(0)',
  '&[data-panel-open="true"]': {
    '--reading-panel-space': 'var(--reading-panel-width)',
  },
  '[data-reading-chrome]': {
    width: 'calc(100% - var(--reading-panel-space))',
    right: 'var(--reading-panel-space)',
    left: 0,
    '@media (prefers-reduced-motion: no-preference)': {
      transition:
        'width 280ms cubic-bezier(0.22, 1, 0.36, 1), left 280ms cubic-bezier(0.22, 1, 0.36, 1), right 280ms cubic-bezier(0.22, 1, 0.36, 1)',
    },
  },
  '@media (prefers-reduced-motion: no-preference)': {
    transition: 'width 280ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  [overlayBreakpoint]: {
    width: '100%',
    transition: 'none',
    '&[data-panel-open="true"]': { '--reading-panel-space': '0px' },
    '[data-reading-chrome]': { transition: 'none' },
  },
});

export const Panel = styled('aside', {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: 'min(400px, 100vw)',
  boxSizing: 'border-box',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  color: 'var(--text-primary)',
  background: 'var(--background)',
  borderLeft: '1px solid var(--border-color)',
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  visibility: 'hidden',
  transform: 'translateX(100%)',
  '&:focus': { outline: 'none' },
  '&[data-open="true"]': {
    visibility: 'visible',
    transform: 'translateX(0)',
  },
  '@media (prefers-reduced-motion: no-preference)': {
    transition:
      'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 280ms',
    '&[data-open="true"]': {
      transitionDelay: '0s',
      // Animate the first opening too, when the panel is lazily mounted.
      animation: `${slideIn} 280ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },
  },
  [overlayBreakpoint]: {
    zIndex: 2,
  },
  '@media (max-width: 600px)': {
    left: 0,
    width: '100%',
    borderLeft: 'none',
  },
});

export const Body = styled('div', {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  padding: 'var(--space-4)',
  overflowWrap: 'anywhere',
});

export const Footer = styled('div', {
  padding: 'var(--space-3)',
});

export const Resume = styled(Button, {
  position: 'fixed',
  right: 'var(--space-4)',
  bottom: 'max(var(--space-4), env(safe-area-inset-bottom))',
  zIndex: 101,
  background: 'var(--gray-000)',
  borderRadius: 'var(--border-radius-3)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
});
