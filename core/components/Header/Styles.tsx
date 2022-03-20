import { motion } from 'framer-motion';
import { css, styled } from '@maximeheckel/design-system';
import Flex from '../Flex';

export const HeaderWrapper = styled(motion.header, {
  position: 'fixed',
  zIndex: 10,
  top: '0',
  backdropFilter: 'blur(8px)',
  width: '100%',
  transition: 'background-color 0.5s, border-color 0.5s',
  background: 'var(--maximeheckel-colors-header)',
  borderBottom: '1px solid',

  '@media (max-width: 700px)': {
    height: '64px !important',
  },
});

export const HeaderTitleWrapper = styled('div', {
  display: 'flex',
  marginLeft: '40px',
  marginRight: '40px',
  overflow: 'hidden',

  a: {
    color: 'inherit',
    textDecoration: 'none',
  },

  '@media (max-width: 700px)': {
    display: 'none',
  },
});

export const HeaderProgressBar = styled(motion.div, {
  '@media (min-width: 700px)': {
    display: 'none',
  },

  position: 'absolute',
  bottom: '0px',
  transformOrigin: 'left',
  height: '2px',
  backgroundColor: 'var(--maximeheckel-colors-typeface-tertiary)',
  width: '100%',
});

export const HeaderPadding = styled('div', {
  height: 'var(--offsetHeight)',
  '@media (max-width: 700px)': {
    height: 'calc(var(--offsetHeight) * 0.6)',
  },
});

export const HeaderContent = styled(Flex, {
  gridColumn: 2,
});

export const fixTruncate = css({
  flex: 1,
  minWidth: 0,
});
