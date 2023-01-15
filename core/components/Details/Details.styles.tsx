import { Box, keyframes, styled } from '@maximeheckel/design-system';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const open = keyframes({
  from: { height: 0, opacity: 0, transform: 'translateY(16px)' },
  to: {
    height: 'var(--radix-collapsible-content-height)',
    opacity: 1,
    transform: 'translateY(0px)',
  },
});

const close = keyframes({
  from: {
    height: 'var(--radix-collapsible-content-height)',
    opacity: 1,
    transform: 'translateY(0px)',
  },
  to: { height: 0, opacity: 0, transform: 'translateY(16px)' },
});

export const CollapsibleContent = styled(CollapsiblePrimitive.Content, {
  overflow: 'hidden',
  '&[data-state="open"]': {
    animation: `${open} 300ms ease-out`,
    '@media screen and (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
  '&[data-state="closed"]': {
    animation: `${close} 300ms ease-out`,
    '@media screen and (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
export const CollapsibleRoot = styled(CollapsiblePrimitive.Root, {
  position: 'relative',
});

export const StyledSummary = styled('summary', {
  padding: 'var(--space-5) var(--space-4)',
  cursor: 'pointer',
  position: 'relative',
  outline: 'none',

  '&::marker': {
    display: 'none',
    content: '',
  },

  '&::-webkit-details-marker': {
    display: 'none',
    content: '',
  },

  '&:before': {
    position: 'absolute',
    left: 0,
    width: 2,
    height: 'var(--space-6)',
    background: 'var(--maximeheckel-colors-brand)',
    content: '',
    display: 'inline-block',
    borderRadius: 'var(--border-radius-2)',
    opacity: 'var(--indicator-opacity, 1)',
    transition: 'opacity 400ms ease-in-out',
    boxShadow: 'var(--indicator-shadow, none)',
  },

  '& svg': {
    transition: 'transform 400ms ease-in-out',
    transform: 'var(--rotation-icon, rotate(0deg))',
  },

  '&:focus-visible': {
    '--indicator-shadow':
      '0 0px 20px 6px var(--maximeheckel-form-input-focus) !important',
    '--indicator-opacity': '1 !important',
  },

  '&[data-state="open"]': {
    '--indicator-shadow': '0 0px 20px 6px var(--maximeheckel-form-input-focus)',
    '--indicator-opacity': 1,
    '--rotation-icon': 'rotate(0deg)',
  },

  '&[data-state="closed"]': {
    '--indicator-shadow': 'none',
    '--indicator-opacity': 0,
    '--rotation-icon': 'rotate(225deg)',
  },
});

export const StyledContent = styled(Box, {
  padding: '0px var(--space-4) var(--space-5) var(--space-4)',
});
