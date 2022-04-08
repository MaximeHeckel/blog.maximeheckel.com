import { css, keyframes, styled } from '@maximeheckel/design-system';
import { GlowProps } from './types';

const pulse = keyframes({
  '0%': {
    transform: 'rotate(0deg)',
    filter: 'blur(8px)',
    borderReadius: '5px',
  },
  '33%': {
    transform: 'rotate(-0.3deg) scale(1.03)',
    filter: 'blur(10px)',
    borderReadius: '3px',
  },
  '66%': {
    transform: 'rotate(0.3deg) scale(0.99)',
    filter: 'blur(14px)',
    borderReadius: '7px',
  },
  '100%': {
    transform: 'rotate(0deg)',
    filter: 'blur(8px)',
    borderReadius: '5px',
  },
});

const StyledGlow = styled('div', {
  animation: `2.7s ease-in-out 0s infinite normal both running ${pulse}`,
  background: `linear-gradient(
    91.83deg,
    hsl(var(--palette-pink-50)) 2.26%,
    hsl(var(--palette-indigo-30)) 145.81%
  )`,
  filter: 'blur(1px)',
  borderRadius: 'var(--border-radius-1)',
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '100%',
  height: '100%',
  opacity: '0.8',
});

const glowWrapper = css({
  position: 'relative',
  maxWidth: 'max-content',
});

const Glow = (props: GlowProps) => {
  const { children, ...rest } = props;

  return (
    <div className={glowWrapper()} {...rest}>
      <StyledGlow />
      {props.children}
    </div>
  );
};

export default Glow;
