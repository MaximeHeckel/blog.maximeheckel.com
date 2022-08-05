import { Card, Range, useDebouncedValue } from '@maximeheckel/design-system';
import { motion } from 'framer-motion';
import React from 'react';
import { AnimationCardContent, Form, HighlightedValue } from '../Components';

const Orchestration = () => {
  const [key, setKey] = React.useState(0);
  const [delayChildren, setDelayChildren] = React.useState(0.5);
  const [staggerChildren, setStaggerChildren] = React.useState(0.5);

  const debouncedDelay = useDebouncedValue(delayChildren, 500);
  const debouncedStagger = useDebouncedValue(staggerChildren, 500);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDelay, debouncedStagger]);

  return (
    <Card
      depth={1}
      css={{
        marginBottom: '30px',
      }}
    >
      <AnimationCardContent
        css={{
          margin: '0 auto',
          maxWidth: '400px',
          height: '500px',
          paddingBottom: '32px',
        }}
      >
        <Form>
          <Range
            id="delayChildren"
            label={
              <span>
                Delay Children:{' '}
                <HighlightedValue>{delayChildren}</HighlightedValue>
              </span>
            }
            aria-label="Delay Children"
            min={0}
            max={5}
            step="0.1"
            value={delayChildren}
            onChange={(value) => setDelayChildren(value)}
          />

          <Range
            id="staggerChildren"
            label={
              <span>
                Stagger Children:{' '}
                <HighlightedValue>{staggerChildren}</HighlightedValue>
              </span>
            }
            aria-label="Stagger Children"
            min={0}
            max={5}
            step="0.1"
            value={staggerChildren}
            onChange={(value) => setStaggerChildren(value)}
          />
        </Form>
        <motion.div
          key={key}
          style={{
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
    </Card>
  );
};

export default Orchestration;
