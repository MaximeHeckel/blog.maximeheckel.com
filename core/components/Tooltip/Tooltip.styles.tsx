import { Shadows } from 'lib/tokens/shadows';
import { keyframes } from 'styled-system/css';
import { styled } from 'styled-system/jsx';

const slideUpAndFadeIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(var(--space-1)) scale(0.98)' },
  '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const slideRightAndFadeIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateX(calc(-1 * var(--space-1))) scale(0.98)',
  },
  '100%': { opacity: 1, transform: 'translateX(0) scale(1)' },
});

const slideDownAndFadeIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(calc(-1 * var(--space-1))) scale(0.98)',
  },
  '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
});

const slideLeftAndFadeIn = keyframes({
  '0%': { opacity: 0, transform: 'translateX(var(--space-1)) scale(0.98)' },
  '100%': { opacity: 1, transform: 'translateX(0) scale(1)' },
});

export const TooltipPopupStyles = {
  color: 'var(--text-secondary)',
  background: 'var(--foreground)',
  border: '2px solid var(--border-color)',
  borderRadius: 'var(--border-radius-1)',
  fontWeight: 'var(--font-weight-500)',
  fontSize: 'var(--font-size-1)',
  padding: '4px 10px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
  boxShadow: `${Shadows[1]}`,
  zIndex: 999,

  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '150ms',
    animationTimingFunction: 'ease-in-out',
    willChange: 'transform, opacity, scale',
    '&[data-open]': {
      '&[data-side="top"]': { animationName: slideDownAndFadeIn },
      '&[data-side="right"]': { animationName: slideLeftAndFadeIn },
      '&[data-side="bottom"]': { animationName: slideUpAndFadeIn },
      '&[data-side="left"]': { animationName: slideRightAndFadeIn },
    },
  },
} as const;

export const StyledTooltipPopup = styled('div', { base: TooltipPopupStyles });
