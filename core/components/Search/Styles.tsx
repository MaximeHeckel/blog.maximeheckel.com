import { motion } from 'framer-motion';
import { Shadows, styled, Text } from '@maximeheckel/design-system';
import { HEIGHT, MAX_HEIGHT } from './constants';

export const Result = styled(motion.li, {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '0px',
  listStyle: 'none',
  fontSize: 'var(--font-size-2)',
  lineHeight: '24px',
  color: 'var(--maximeheckel-colors-typeface-secondary)',
  padding: '10px 25px',
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
        backgroundColor: 'var(--maximeheckel-colors-foreground)',
        a: {
          color: 'var(--maximeheckel-colors-brand)',
        },
        '> div': {
          opacity: 1,
        },
      },
    },
  },
});

export const SearchResults = styled('ul', {
  background: 'var(--maximeheckel-colors-body)',
  maxHeight: `${MAX_HEIGHT}px`,
  overflowY: 'scroll',
  margin: '0',
  padding: '0',

  '@media (max-width: 700px)': {
    maxHeight: '450px',
  },
});

export const SearchBox = styled(motion.div, {
  position: 'fixed',
  overflow: 'hidden',
  width: '600px',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  borderRadius: 'var(--border-radius-2)',
  boxShadow: Shadows[3],
  border: '1px solid var(--maximeheckel-border-color)',

  '@media (max-width: 700px)': {
    width: '100%',
    top: '0',
    borderRadius: '0px',
  },
});

export const FormWrapper = styled('div', {
  background: 'var(--maximeheckel-colors-body)',

  form: {
    margin: '0px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--maximeheckel-border-color)',
  },

  input: {
    background: 'transparent',
    border: 'none',
    fontSize: 'var(--font-size-2)',
    fontWeight: '400',
    height: '55px',
    padding: '0px 25px',
    width: '100%',
    outline: 'none',
    color: 'var(--maximeheckel-colors-typeface-primary)',

    '&::placeholder': {
      color: 'var(--maximeheckel-colors-typeface-secondary)',
      opacity: '0.54',
    },
    '&::-webkit-input-placeholder': {
      color: 'var(--maximeheckel-colors-typeface-secondary)',
      opacity: '0.54',
    },
    '&:-ms-input-placeholder': {
      color: 'var(--maximeheckel-colors-typeface-secondary)',
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
      color: 'var(--maximeheckel-colors-typeface-primary)',
      fontSize: 'var(--font-size-1)',
    },
  },
});

export const Overlay = styled(motion.div, {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  zIndex: '999',
  outline: 'none',
});

export const KBD = (props: React.HTMLAttributes<HTMLParagraphElement>) => (
  <Text
    {...props}
    as="kbd"
    css={{
      fontFamily: 'var(--font-display)',
      borderRadius: 'var(--border-radius-1)',
      padding: '8px',
      background: 'var(--maximeheckel-colors-emphasis)',
      '&:not(:last-child)': {
        marginRight: '12px',
      },
    }}
    size="1"
    variant="info"
  />
);

export const Item = styled('li', {
  height: `${HEIGHT}px`,
  marginBottom: '0px',
  transition: '0.25s',
  listStyle: 'none',
  fontSize: 'var(--font-size-2)',
  color: 'var(--maximeheckel-colors-typeface-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 25px',
  userSelect: 'none',

  a: {
    color: 'unset',
    width: '100%',
    height: `${HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },

  '&:hover': {
    backgroundColor: 'var(--maximeheckel-colors-emphasis)',

    '&[data-nohover]': {
      backgroundColor: 'inherit',
    },

    a: {
      color: 'var(--maximeheckel-colors-brand)',
    },

    svg: {
      stroke: 'var(--maximeheckel-colors-brand)',
    },
  },
});

export const Separator = styled('li', {
  height: '30px',
  width: '100%',
  fontSize: 'var(--font-size-1)',
  backgroundColor: 'var(--maximeheckel-colors-foreground)',
  color: 'var(--maximeheckel-colors-typeface-tertiary)',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '25px',
  paddingRight: '25px',
  marginBottom: '0',
});
