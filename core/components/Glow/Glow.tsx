import { css, keyframes } from 'styled-system/css';
import { styled } from 'styled-system/jsx';

import Box from '@core/components/Box';

import { GlowProps } from './types';

const pulse = keyframes({
  '0%': {
    transform: 'rotate(0deg)',
    filter: 'blur(8px)',
  },
  '33%': {
    transform: 'rotate(-0.3deg) scale(1.03)',
    filter: 'blur(10px)',
  },
  '66%': {
    transform: 'rotate(0.3deg) scale(0.99)',
    filter: 'blur(14px)',
  },
  '100%': {
    transform: 'rotate(0deg)',
    filter: 'blur(8px)',
  },
});

const StyledGlow = styled('div', {
  base: {
    animation: `2.7s ease-in-out 0s infinite normal both running ${pulse}`,
    background: `linear-gradient(
    91.83deg,
    var(--pink-500) 2.26%,
    var(--blue-800) 95.81%
  )`,
    filter: 'blur(1px)',
    borderRadius: 'var(--border-radius-1)',
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    opacity: '0.8',
  },
});

const glowWrapper = css({
  position: 'relative',
  maxWidth: 'max-content',
});

const Glow = (props: GlowProps) => {
  const { children, css, ...rest } = props;

  return (
    <Box css={{ ...css }} className={glowWrapper} {...rest}>
      <StyledGlow />
      {children}
    </Box>
  );
};

export default Glow;
