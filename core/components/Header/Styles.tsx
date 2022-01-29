import { motion } from 'framer-motion';
import { css, styled } from 'lib/stitches.config';
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
  boxShadow: 'var(--maximeheckel-shadow-0)',

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
