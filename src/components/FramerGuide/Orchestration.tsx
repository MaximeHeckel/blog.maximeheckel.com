import { motion } from 'framer-motion';
import React from 'react';
import {
  AnimationCard,
  AnimationCardContent,
  Form,
  HighlightedValue,
} from './Components';
import { useDebounce } from './utils';

const Orchestration = () => {
  const [key, setKey] = React.useState(0);
  const [delayChildren, setDelayChildren] = React.useState(0.5);
  const [staggerChildren, setStaggerChildren] = React.useState(0.5);

  const debouncedDelay = useDebounce(delayChildren, 500);
  const debouncedStagger = useDebounce(staggerChildren, 500);

  const boxVariants = {
    out: {
      y: 600,
    },
    in: {
      y: 0,
      transition: {
        duration: '0.6',
        delayChildren,
        staggerChildren,
      },
    },
  };

  const iconVariants = {
    out: {
      x: -600,
    },
    in: {
      x: 0,
    },
  };

  React.useEffect(() => {
    setKey(key + 1);
  }, [debouncedDelay, debouncedStagger]);

  return (
    <AnimationCard
      css={{
        width: '100%',
        maxWidth: '700px',
      }}
    >
      <AnimationCardContent
        css={{
          margin: '0 auto',
          maxWidth: '400px',
        }}
      >
        <Form>
          <div style={{ display: 'grid' }}>
            <label htmlFor="delayChildren">
              Delay Children:{' '}
              <HighlightedValue>{delayChildren}</HighlightedValue>
            </label>
            <input
              id="delayChildren"
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={delayChildren}
              onChange={e => setDelayChildren(parseFloat(e.target.value))}
            />
          </div>
          <div style={{ display: 'grid' }}>
            <label htmlFor="staggerChildren">
              Stagger Children:{' '}
              <HighlightedValue>{staggerChildren}</HighlightedValue>
            </label>
            <input
              id="staggerChildren"
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={staggerChildren}
              onChange={e => setStaggerChildren(parseFloat(e.target.value))}
            />
          </div>
        </Form>
        <motion.div
          key={key}
          css={{
            background: 'linear-gradient(90deg,#ffa0ae 0%,#aacaef 75%)',
            height: '280px',
            width: '230px',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            fontSize: '48px',
            overflow: 'hidden',
          }}
          variants={boxVariants}
          initial="out"
          animate="in"
        >
          <motion.span
            role="img"
            aria-labelledby="magic wand"
            variants={iconVariants}
          >
            🚀
          </motion.span>
          <motion.span
            role="img"
            aria-labelledby="sparkles"
            variants={iconVariants}
          >
            ✨
          </motion.span>
          <motion.span
            role="img"
            aria-labelledby="party popper"
            variants={iconVariants}
          >
            🎉
          </motion.span>
        </motion.div>
      </AnimationCardContent>
    </AnimationCard>
  );
};

export default Orchestration;
