import { Card, Flex, useDebouncedValue } from '@maximeheckel/design-system';
import { motion } from 'motion/react';
import React from 'react';

import { Slider } from '@core/components/Slider';

import { AnimationCardContent, Form } from '../Components';

const Orchestration = () => {
  const [key, setKey] = React.useState(0);
  const [delayChildren, setDelayChildren] = React.useState(3);
  const [staggerChildren, setStaggerChildren] = React.useState(3.5);

  const debouncedDelay = useDebouncedValue(delayChildren, 500);
  const debouncedStagger = useDebouncedValue(staggerChildren, 500);

  const boxVariants = {
    out: {
      y: 600,
    },
    in: {
      y: 0,
      transition: {
        duration: 0.6,
        delayChildren,
        staggerChildren,
      },
    },
  } as const;

  const iconVariants = {
    out: {
      x: -600,
    },
    in: {
      x: 0,
    },
  } as const;

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
          <Flex direction="column" gap={4}>
            <Slider
              id="delayChildren"
              label="Delay Children"
              aria-label="Delay Children"
              min={0}
              max={5.0}
              step={0.1}
              value={delayChildren}
              onChange={(value) => setDelayChildren(value)}
            />

            <Slider
              id="staggerChildren"
              label="Stagger Children"
              aria-label="Stagger Children"
              min={0}
              max={5.0}
              step={0.1}
              value={staggerChildren}
              onChange={(value) => setStaggerChildren(value)}
            />
          </Flex>
        </Form>
        <motion.div
          key={key}
          style={{
            background: 'var(--emphasis)',
            height: '280px',
            width: '280px',
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
