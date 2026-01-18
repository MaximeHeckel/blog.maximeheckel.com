import { GlassMaterial, styled } from '@maximeheckel/design-system';

export const Overlay = styled('div', {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'oklch(from var(--background) l c h / 50%)',
  backdropFilter: 'blur(4px)',
});

export const Dialog = styled('div', {
  position: 'fixed',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '600px',
  zIndex: 101,

  overflow: 'hidden',

  '@media (max-width: 700px)': {
    width: '95%',
  },

  '&:focus': { outline: 'none' },
});

export const Input = styled('input', {
  background: 'transparent',
  border: 'none',

  fontSize: 'var(--font-size-1)',
  fontFamily: 'inherit',
  fontWeight: 400,
  height: '55px',
  padding: '0px 18px',
  width: '100%',
  outline: 'none',
  color: 'var(--text-primary)',

  '&::placeholder': {
    color: 'var(--text-primary)',
    opacity: 0.54,
  },

  WebkitAppearance: 'none',
  MozAppearance: 'none',

  '&::-webkit-search-cancel-button': {
    WebkitAppearance: 'none',
  },
  '&::-webkit-search-decoration': {
    WebkitAppearance: 'none',
  },

  '@media (max-width: 500px)': {
    fontSize: '16px',
  },
});

export const List = styled('div', {
  maxHeight: 'min(460px, 50vh)',
  overflowY: 'auto',
  padding: '8px',
  transition: 'height 0.15s ease',
  borderTop: '1.5px solid oklch(from var(--gray-900) l c h / 15%)',

  '&:not(:has([cmdk-group], [cmdk-item], [cmdk-empty], [cmdk-loading]))': {
    display: 'none',
    padding: '0px 8px 8px 8px',
  },

  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'oklch(from var(--gray-700) l c h / 0.4)',
    borderRadius: '4px',
  },
  scrollbarColor: 'oklch(from var(--gray-700) l c h / 0.4) transparent',
});

export const Empty = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  height: '48px',
  padding: '0 12px',
  color: 'var(--text-primary)',
  opacity: 0.75,
  fontSize: 'var(--font-size-1)',
});

export const Loading = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  height: '48px',
  padding: '0 12px',
  color: 'var(--text-primary)',
  opacity: 0.75,
  fontSize: 'var(--font-size-1)',
});

export const Group = styled('div', {
  '& + &': {
    marginTop: '8px',
  },

  '[cmdk-group-heading]': {
    fontSize: 'var(--font-size-1)',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    padding: '8px 8px 8px 12px',
    userSelect: 'none',
  },
});

export const Item = styled('div', {
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '0 12px',
  borderRadius: 'var(--border-radius-1)',
  fontSize: 'var(--font-size-1)',
  fontWeight: 500,
  color: 'var(--text-primary)',
  cursor: 'pointer',
  userSelect: 'none',

  svg: {
    flexShrink: 0,
  },

  '@media (pointer: fine)': {
    '&[aria-selected="true"]': {
      opacity: 1,
      backgroundColor:
        'oklch(from var(--gray-700) l c h / var(--opacity, 0.5))',
    },
  },
});

export const ItemLabel = styled('span', {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const ItemDetail = styled('span', {
  fontSize: 'var(--font-size-1)',
  color: 'var(--text-secondary)',
  fontWeight: 400,
  flexShrink: 0,
  marginLeft: 'auto',
  opacity: 0.5,
});

export const Divider = styled('div', {
  height: '1px',
  background: 'var(--border-color)',
  margin: '8px 0px',
});

export const SecondaryItem = styled('div', {
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '0 12px',
  borderRadius: 'var(--border-radius-2)',
  fontSize: 'var(--font-size-1)',
  fontWeight: 400,
  color: 'var(--text-primary)',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background 0.15s ease, color 0.15s ease',

  svg: {
    flexShrink: 0,
  },

  '@media (pointer: fine)': {
    '&[aria-selected="true"]': {
      opacity: 1,
      backgroundColor:
        'oklch(from var(--gray-700) l c h / var(--opacity, 0.5))',
    },
  },
});

export const CustomGlassMaterial = styled(GlassMaterial, {
  'background-color':
    'oklch(from var(--gray-300) l c h / var(--opacity, 0.75))',
  'backdrop-filter': 'blur(var(--blur, 6px)) saturate(var(--saturate, 1.15))',
  border:
    'var(--thickness, 1px) solid oklch(from var(--gray-900) l c h / 15%) !important',
});
