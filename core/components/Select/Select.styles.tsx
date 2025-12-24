import { Select as BaseSelect } from '@base-ui/react/select';
import { styled } from '@maximeheckel/design-system';

export const SelectTrigger = styled(BaseSelect.Trigger, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-2)',
  padding: 'var(--space-1) var(--space-2)',
  backgroundColor: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
  backdropFilter: 'blur(var(--blur, 12px)) saturate(var(--saturate, 1.15))',
  border:
    'var(--thickness, 1px) solid oklch(from var(--gray-1100) l c h / 15%)',
  borderRadius: 'var(--border-radius-1)',
  height: '34px',
  cursor: 'pointer',
  color: 'var(--text-primary)',
  letterSpacing: '-0.022em',
  fontFamily: 'var(--font-display)',
  fontWeight: '500',
  minWidth: 'var(--min-width)',
  transition: 'background-color 0.25s ease-in-out',

  '&[disabled]': {
    cursor: 'not-allowed',
    opacity: 0.4,
    filter: 'grayscale(0.25)',
  },

  '&:hover:not([disabled])': {
    backgroundColor: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.4))',
  },

  '&:focus-visible:not([disabled])': {
    outline: '2px solid var(--blue-800)',
    outlineOffset: 2,
    backgroundColor: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.4))',
  },
});

export const SelectIcon = styled(BaseSelect.Icon, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-primary)',
});

export const SelectPopup = styled(BaseSelect.Popup, {
  borderRadius: 'var(--border-radius-2)',
  backgroundColor: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
  backdropFilter: 'blur(var(--blur, 12px)) saturate(var(--saturate, 1.15))',
  border:
    'var(--thickness, 1px) solid oklch(from var(--gray-1100) l c h / 15%)',
  color: 'var(--color-gray-900)',
  minWidth: 'var(--anchor-width)',
  transformOrigin: 'var(--transform-origin)',
  transition: 'transform 0.15s, opacity 0.15s',
  padding: 'var(--space-1) 0px',

  '&[data-starting-style], &[data-ending-style]': {
    opacity: 0,
    transform: 'scale(0.9)',
  },

  '&[data-side="none"]': {
    transition: 'none',
    transform: 'none',
    opacity: 1,
    minWidth: 'calc(var(--anchor-width) + 1rem)',
  },

  outline: '1px solid var(--color-gray-300)',
});

export const SelectItem = styled(BaseSelect.Item, {
  boxSizing: 'border-box',
  outline: 0,
  fontWeight: 'var(--font-weight-500)',
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--font-size-1)',
  letterSpacing: '-0.022em',
  padding: 'var(--space-2) var(--space-2) var(--space-2) var(--space-3)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'var(--space-2)',
  cursor: 'pointer',
  userSelect: 'none',
  scrollMarginBlock: '0.25rem',

  '@media (pointer: coarse)': {
    paddingBlock: '0.625rem',
  },

  "[data-side='none'] &": {
    paddingRight: '3rem',
  },

  '@media (hover: hover)': {
    '&[data-highlighted]': {
      zIndex: 0,
      position: 'relative',
      color: 'var(--color-gray-50)',
    },

    '&[data-highlighted]::before': {
      content: "''",
      zIndex: -1,
      position: 'absolute',
      insetBlock: 0,
      insetInline: 4,
      borderRadius: 'var(--border-radius-1)',
      backgroundColor:
        'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
    },
  },
});

export const SelectItemIndicator = styled(BaseSelect.ItemIndicator, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-primary)',
});
