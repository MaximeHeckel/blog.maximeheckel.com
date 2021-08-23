import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { LinkButton } from '@theme/components/Button/LinkButton';
import DesignSystemCard from '@theme/components/Card';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import InlineCode from '../../InlineCode';
import { AnimationCardContent, TransitionGridWrapper } from './Components';

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
      <DesignSystemCard
        depth={1}
        css={css`
          margin-bottom: 2.25rem;
        `}
      >
        <DesignSystemCard.Header>
          <div>
            Without <InlineCode>AnimatePresence</InlineCode>
          </div>
        </DesignSystemCard.Header>
        <AnimationCardContent>
          <ContentDemo />
        </AnimationCardContent>
      </DesignSystemCard>
      <DesignSystemCard
        depth={1}
        css={css`
          margin-bottom: 2.25rem;
        `}
      >
        <DesignSystemCard.Header>
          <div>
            With <InlineCode>AnimatePresence</InlineCode>
          </div>
        </DesignSystemCard.Header>
        <AnimationCardContent>
          <ContentDemo withAnimatePresence />
        </AnimationCardContent>
      </DesignSystemCard>
    </TransitionGridWrapper>
  );
};

export default FramerMotionAnimatePresence;
