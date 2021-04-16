import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { LinkButton } from 'gatsby-theme-maximeheckel/src/components/Button/LinkButton';
import React from 'react';
import { AnimationCard, AnimationCardContent } from './Components';

const PerspectiveIcon = () => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.0645 2.92166L2.06452 7.92166L12.0645 12.9217L22.0645 7.92166L12.0645 2.92166Z"
      stroke="var(--maximeheckel-colors-typeface-2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.06452 17.9217L12.0645 22.9217L22.0645 17.9217"
      stroke="var(--maximeheckel-colors-typeface-2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.06452 12.9217L12.0645 17.9217L22.0645 12.9217"
      stroke="var(--maximeheckel-colors-typeface-2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardWrapper = styled('div')`
  position: relative;
  width: 300px;
  height: 200px;
`;

const Wrapper = styled(motion.div)`
  position: relative;
  cursor: default;
`;

const CaptureLayer = styled(motion.div)<{ show?: boolean }>`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 32px;
  background: repeating-linear-gradient(
    -45deg,
    var(--maximeheckel-colors-foreground),
    var(--maximeheckel-colors-foreground) 5px,
    var(--maximeheckel-colors-emphasis) 5px,
    var(--maximeheckel-colors-emphasis) 10px
  );
  z-index: 3;
  opacity: ${(p) => (p.show ? 1 : 0)};
  transform-style: preserve-3d;
  box-shadow: 1px 1px 0 1px var(--maximeheckel-colors-emphasis),
    -1px 0 28px 0 rgb(34 33 81 / 1%), 28px 28px 28px 0 rgb(34 33 81 / 25%);
  transition: 0.4s ease-in-out box-shadow, 0.4s ease-in-out opacity;
  &:hover {
    box-shadow: 1px 1px 0 1px var(--maximeheckel-colors-emphasis),
      -1px 0 28px 0 rgba(34, 33, 81, 0.01),
      54px 54px 28px -10px rgba(34, 33, 81, 0.15);
  }
`;

const Glow = styled(motion.div)`
  background: linear-gradient(104.01deg, #9bebeb 5.51%, #0fa6e9 98.93%);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-filter: blur(15px);
  filter: blur(15px);
  border-radius: 32px;
`;

const Card = styled('div')`
  border-radius: 32px;
  border: 1px solid var(--maximeheckel-colors-emphasis);
  margin-bottom: 0px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: var(--maximeheckel-shadow-2);
  position: relative;
  height: 100%;
  div {
    color: #4a4a4c;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
  }
`;

const CardWithGlow = () => {
  const glowVariants = {
    hover: (inPerspective: boolean) => ({
      opacity: 0.8,
      translateX: inPerspective ? 35 : 0,
      translateY: inPerspective ? 35 : 0,
    }),
    initial: {
      opacity: 0,
    },
  };

  const tagVariants = {
    hover: {
      opacity: 1,
    },
    initial: {
      opacity: 0,
    },
  };

  const topLayerVariants = {
    hover: {
      translateX: -25,
      translateY: -10,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    initial: {
      translateX: -10,
      translateY: 5,
    },
  };

  const layerVariants = {
    active: (inPerspective: boolean) => ({
      rotateX: inPerspective ? 51 : 0,
      rotateY: 0,
      rotateZ: inPerspective ? 43 : 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    }),
    initial: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  const [inPerspective, setInPerspective] = React.useState(false);

  return (
    <div
      css={css`
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      `}
    >
      <Wrapper
        initial="initial"
        whileHover="hover"
        whileTap="hover"
        animate="active"
        custom={inPerspective}
        variants={layerVariants}
      >
        <CaptureLayer show={inPerspective} variants={topLayerVariants} />
        <h3>Hover me!</h3>
        <CardWrapper>
          <Glow variants={glowVariants} custom={inPerspective} />
          <Card>
            <div>✨ It&apos;s magic! ✨</div>
          </Card>
        </CardWrapper>
        {inPerspective ? (
          <motion.div
            css={css`
              position: absolute;
              font-size: 12px;
              top: -55px;
              max-width: 250px;
            `}
            variants={tagVariants}
          >
            Top Layer: motion component wrapper sets variant &quot;hover&quot;
            on hover
          </motion.div>
        ) : null}
        {inPerspective ? (
          <motion.div
            css={css`
              position: absolute;
              font-size: 12px;
              bottom: -75px;
              right: -15px;
              max-width: 250px;
            `}
            variants={tagVariants}
          >
            Bottom Layer: &quot;Glow&quot; motion component consumes hover
            variant
          </motion.div>
        ) : null}
      </Wrapper>
      <br />
      <br />
      <LinkButton
        title={inPerspective ? 'Disable perspective' : 'Enable perspective'}
        onClick={() => setInPerspective((prev) => !prev)}
      >
        <PerspectiveIcon />
      </LinkButton>
    </div>
  );
};

const FramerMotionPropagation = () => {
  return (
    <AnimationCard>
      <AnimationCardContent>
        <CardWithGlow />
      </AnimationCardContent>
    </AnimationCard>
  );
};

export default FramerMotionPropagation;
