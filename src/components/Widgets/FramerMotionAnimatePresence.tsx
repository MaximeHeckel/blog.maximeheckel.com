import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { LinkButton } from 'gatsby-theme-maximeheckel/src/components/Button/LinkButton';
import { InlineCode } from 'gatsby-theme-maximeheckel/src/components/MDX/Code';
import React from 'react';
import {
  AnimationCard,
  AnimationCardContent,
  AnimationCardHeader,
  TransitionGridWrapper,
} from './Components';

const CardWrapper = styled('div')`
  height: 300px;
  position: relative;
`;

const Card = styled('div')`
  position: absolute;
  border-radius: 32px;
  margin-bottom: 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(104.01deg, #9bebeb 5.51%, #0fa6e9 98.93%);
  transform: perspective(1000px) rotateY(15deg);
  width: 250px;
  height: 300px;
  font-size: 64px;
  transition: transform 0.8s ease 0s;
  &:hover {
    transform: perspective(2000px) rotateY(2deg);
  }
`;

const ITEMS = ['🚀', '🎉', '🎊'];

interface Props {
  withAnimatePresence?: boolean;
}

const ContentDemo = (props: Props) => {
  const { withAnimatePresence } = props;
  const [selected, setSelected] = React.useState(0);
  const [buttonAboutToBeClicked, setAboutToBeClicked] = React.useState('next');

  const next = () => {
    if (selected === ITEMS.length - 1) {
      setSelected(0);
    } else {
      setSelected((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (selected === 0) {
      setSelected(ITEMS.length - 1);
    } else {
      setSelected((prev) => prev - 1);
    }
  };

  const cardVariants = {
    initial: (next: boolean) => ({
      x: next ? -500 : 500,
    }),
    animate: {
      x: -125,
      transition: {
        duration: 0.4,
        //delay: 0.2,
      },
    },
    exit: (next: boolean) => ({
      x: next ? 500 : -500,
      transition: {
        duration: 0.4,
      },
    }),
  };

  const WrapperComponent = withAnimatePresence
    ? AnimatePresence
    : (props: { children: React.ReactNode }) => <div {...props} />;

  return (
    <>
      <CardWrapper>
        {ITEMS.map((item, index) => {
          return (
            <WrapperComponent key={`foo-${index}`}>
              {index === selected ? (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={cardVariants}
                  custom={buttonAboutToBeClicked === 'next'}
                >
                  <Card>
                    <div>{item}</div>
                  </Card>
                </motion.div>
              ) : null}
            </WrapperComponent>
          );
        })}
      </CardWrapper>
      <div
        css={css`
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <LinkButton
          id="prev"
          aria-label="Previous"
          onMouseEnter={() => setAboutToBeClicked('prev')}
          onClick={prev}
        >
          &#8592;
        </LinkButton>
        <LinkButton
          id="next"
          aria-label="Next"
          onMouseEnter={() => setAboutToBeClicked('next')}
          onClick={next}
        >
          &#8594;
        </LinkButton>
      </div>
    </>
  );
};

const FramerMotionAnimatePresence = () => {
  return (
    <TransitionGridWrapper>
      <AnimationCard>
        <AnimationCardHeader>
          Without <InlineCode>AnimatePresence</InlineCode>
        </AnimationCardHeader>
        <AnimationCardContent>
          <ContentDemo />
        </AnimationCardContent>
      </AnimationCard>
      <AnimationCard>
        <AnimationCardHeader>
          With <InlineCode>AnimatePresence</InlineCode>
        </AnimationCardHeader>
        <AnimationCardContent>
          <ContentDemo withAnimatePresence />
        </AnimationCardContent>
      </AnimationCard>
    </TransitionGridWrapper>
  );
};

export default FramerMotionAnimatePresence;
