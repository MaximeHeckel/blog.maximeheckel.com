import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { GlowProps } from './types';

const StyledGlow = styled('div')`
  animation: 2.7s ease-in-out 0s infinite normal both running pulse;
  background: linear-gradient(
    91.83deg,
    hsl(var(--palette-pink-50)) 2.26%,
    hsl(var(--palette-indigo-30)) 145.81%
  );
  filter: blur(1px);
  border-radius: 8px;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  opacity: 0.8;

  @keyframes pulse {
    0% {
      transform: rotate(0deg);
      filter: blur(8px);
      border-radius: 5px;
    }

    33% {
      transform: rotate(-0.3deg) scale(1.03);
      filter: blur(10px);
      border-radius: 3px;
    }

    66% {
      transform: rotate(0.3deg) scale(0.99);
      filter: blur(14px);
      border-radius: 7px;
    }

    100% {
      transform: rotate(0deg);
      filter: blur(8px);
      border-radius: 5px;
    }
  }
`;

const Glow = (props: GlowProps) => {
  const { children, ...rest } = props;

  return (
    <div
      css={css`
        position: relative;
        max-width: max-content;
      `}
      {...rest}
    >
      <StyledGlow />
      {props.children}
    </div>
  );
};

export default Glow;
