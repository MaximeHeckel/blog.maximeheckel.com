import {
  Box,
  keyframes,
  Shadows,
  styled,
  Text,
} from '@maximeheckel/design-system';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { HEIGHT, MAX_HEIGHT, SHORTCUT_HEIGHT } from './constants';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1.0 },
});

const overlayHide = keyframes({
  '0%': { opacity: 0.7 },
  '100%': { opacity: 0 },
});

export const Overlay = styled(Dialog.Overlay, {
  opacity: 0.5,
  position: 'fixed',
  inset: 0,
  zIndex: '100',
  backdropFilter: 'blur(4px)',
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${overlayShow} 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
    },

    '&[data-state="closed"]': {
      animation: `${overlayHide} var(--exit-duration, 0ms) ease-in-out forwards`,
    },
  },
});

export const Content = styled(Dialog.Content, {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '600px',
  zIndex: '101',

  '@media (max-width: 700px)': {
    width: '95%',
  },

  '&:focus': { outline: 'none' },
});

export const Result = styled(motion.li, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0px',
  listStyle: 'none',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-500)',
  lineHeight: '24px',
  color: 'var(--text-secondary)',
  padding: '10px 16px',
  height: `${HEIGHT}px`,

  a: {
    color: 'unset',
    display: 'block',
    width: '500px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'none',
  },

  '> div': {
    opacity: 0,
  },

  variants: {
    selected: {
      true: {
        backgroundColor: 'var(--foreground)',
        a: {
          color: 'var(--accent)',
        },
        '> div': {
          opacity: 1,
        },
      },
    },
  },
});

export const ResultListWrapper = styled(Box, {
  height: `${MAX_HEIGHT + SHORTCUT_HEIGHT}px`,
});

export const ResultList = styled('ul', {
  background: 'var(--background)',
  maxHeight: `${MAX_HEIGHT + SHORTCUT_HEIGHT}px`,
  overflowY: 'scroll',
  margin: '0',
  padding: '0',

  width: '100%',

  boxShadow: Shadows[3],
  borderBottomLeftRadius: 'var(--border-radius-2)',
  borderBottomRightRadius: 'var(--border-radius-2)',
  borderLeft: '1px solid var(--border-color)',
  borderRight: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)',

  '@media (max-width: 700px)': {
    maxHeight: '450px',
  },
});

export const SearchBox = styled(Box, {
  width: '100%',
  position: 'relative',
});

export const FormWrapper = styled(Box, {
  position: 'relative',
  margin: '0 auto',
  background: 'var(--background)',
  border: '1px solid var(--border-color)',
  borderTopLeftRadius: 'var(--border-radius-2)',
  borderTopRightRadius: 'var(--border-radius-2)',

  form: {
    margin: '0px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export const SearchInput = styled('input', {
  background: 'transparent',
  border: 'none',
  fontSize: 'var(--font-size-2)',
  fontFamily: 'inherit',
  fontWeight: '400',
  height: '55px',
  padding: '0px 16px',
  width: '100%',
  outline: 'none',
  color: 'var(--text-primary)',

  '&::placeholder': {
    color: 'var(--text-secondary)',
    opacity: '0.54',
  },
  '&::-webkit-input-placeholder': {
    color: 'var(--text-secondary)',
    opacity: '0.54',
  },
  '&:-ms-input-placeholder': {
    color: 'var(--text-secondary)',
    opacity: '0.54',
  },

  WebkitAppearance: 'none',
  MozAppearance: 'none',
  outlineOffset: '-2px',

  '&::-webkit-search-cancel-button': {
    WebkitAppearance: 'none',
  },
  '&::-webkit-search-decoration': {
    WebkitAppearance: 'none',
  },
  '&::-webkit-file-upload-button': {
    WebkitAppearance: 'button',
    font: 'inherit',
  },

  '&::-webkit-autofill': {
    background: 'transparent',
    color: 'var(--text-primary)',
  },

  '@media (max-width: 500px)': {
    fontSize: '16px',
  },
});

export const AIInput = styled(SearchInput, {
  padding: '0px 8px',
  '&:disabled': {
    cursor: 'not-allowed',
  },
});

export const Item = styled('li', {
  height: `${HEIGHT}px`,
  marginBottom: '0px',
  transition: '0.25s',
  listStyle: 'none',
  fontSize: 'var(--font-size-1)',
  fontWeight: '500',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 4px',
  userSelect: 'none',
  borderRadius: 'var(--border-radius-2)',

  'a, button': {
    color: 'unset',
    width: '100%',
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-display)',
    height: `${HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '0px 8px',
  },

  '&:hover, &[data-selected="true"]': {
    backgroundColor: 'var(--emphasis)',

    '&[data-nohover]': {
      backgroundColor: 'inherit',
    },

    'a, button': {
      color: 'var(--accent)',
    },

    svg: {
      stroke: 'var(--accent)',
    },
  },
});

export const Separator = styled(Box, {
  width: '100%',
  fontSize: 'var(--font-size-1)',
  color: 'var(--text-primary)',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '0',
  padding: '20px 12px 8px 12px',
});

export const ShortcutList = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  backgroundColor: 'var(--background)',
  height: SHORTCUT_HEIGHT,
  padding: '0px 20px',
  borderTop: '1px solid var(--border-color)',
});

export const KBD = (props: React.HTMLAttributes<HTMLParagraphElement>) => (
  <Text
    {...props}
    as="kbd"
    css={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--font-weight-500)',
      borderRadius: '6px',
      height: 24,
      width: 24,
      background: 'var(--emphasis)',
    }}
    size="1"
    variant="info"
  />
);
