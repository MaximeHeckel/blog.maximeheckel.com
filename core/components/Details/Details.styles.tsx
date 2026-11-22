import { Collapsible } from '@base-ui/react/collapsible';
import { keyframes } from 'styled-system/css';
import { styled } from 'styled-system/jsx';

import Box from '../Box';

const open = keyframes({
  from: { height: 0, opacity: 0, transform: 'translateY(16px)' },
  to: {
    height: 'var(--collapsible-panel-height)',
    opacity: 1,
    transform: 'translateY(0px)',
  },
});

const close = keyframes({
  from: {
    height: 'var(--collapsible-panel-height)',
    opacity: 1,
    transform: 'translateY(0px)',
  },
  to: { height: 0, opacity: 0, transform: 'translateY(16px)' },
});

export const CollapsiblePanel = styled(Collapsible.Panel, {
  base: {
    overflow: 'hidden',
    '&[data-open]': {
      animation: `${open} 300ms ease-out`,
      '@media screen and (prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
    },
    '&[data-closed]': {
      animation: `${close} 300ms ease-out`,
      '@media screen and (prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
    },
  },
});

export const CollapsibleTrigger = Collapsible.Trigger;
export const CollapsibleRoot = styled(Collapsible.Root, {
  base: {
    position: 'relative',
  },
});

export const StyledSummary = styled('summary', {
  base: {
    padding: 'var(--space-4) var(--space-4)',
    cursor: 'pointer',
    position: 'relative',
    outline: 'none',
    listStyle: 'none',

    '&::marker': {
      display: 'none',
      content: '""',
    },

    '&::-webkit-details-marker': {
      display: 'none',
    },

    '&:before': {
      position: 'absolute',
      left: 0,
      width: '2px',
      height: 'var(--space-5)',
      background: 'var(--accent)',
      content: '""',
      display: 'inline-block',
      borderRadius: 'var(--border-radius-3)',
      opacity: 'var(--indicator-opacity, 1)',
      transition: 'opacity 400ms ease-in-out',
      boxShadow: 'var(--indicator-shadow, none)',
    },

    '& svg': {
      transition: 'transform 400ms ease-in-out',
      transform: 'var(--rotation-icon, rotate(0deg))',
    },

    '&:focus-visible': {
      '--indicator-shadow': '0 0px 20px 6px var(--input-focus) !important',
      '--indicator-opacity': '1 !important',
    },

    '&[aria-expanded="true"]': {
      '--indicator-shadow': '0 0px 20px 6px var(--input-focus)',
      '--indicator-opacity': 1,
      '--rotation-icon': 'rotate(0deg)',
    },

    '&[aria-expanded="false"]': {
      '--indicator-shadow': 'none',
      '--indicator-opacity': 0,
      '--rotation-icon': 'rotate(225deg)',
    },
  },
});

export const StyledContent = styled(Box, {
  base: {
    padding: '0px var(--space-4) var(--space-5) var(--space-4)',
  },
});
