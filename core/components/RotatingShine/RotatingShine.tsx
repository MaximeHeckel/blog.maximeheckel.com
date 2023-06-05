import { Box } from '@maximeheckel/design-system';
import { useAnimationControls, useMotionTemplate, motion } from 'framer-motion';
import { useEffect } from 'react';

const RotatingShine = ({
  status,
}: {
  status: 'initial' | 'loading' | 'done';
}) => {
  const controls = useAnimationControls();

  const variants = {
    strokeVisible: {
      '--opacity': '0%',
      '--opacity-2': '100%',
      transition: {
        ease: 'easeInOut',
        duration: 0.8,
      },
    },
    strokeFull: {
      '--opacity': '100%',
      '--opacity-2': '100%',
      transition: {
        ease: 'easeInOut',
        duration: 0.8,
      },
    },
    strokeInvisible: {
      '--opacity': '0%',
      '--opacity-2': '0%',
      transition: {
        ease: 'easeInOut',
        duration: 0.8,
      },
    },
    rotate: {
      '--r': [
        '0deg',
        '45deg',
        '90deg',
        '135deg',
        '180deg',
        '225deg',
        '270deg',
        '315deg',
        '360deg',
      ],
      '--x': ['25%', '50%', '75%', '50%', '25%'],
      '--y': ['50%', '25%', '50%', '75%', '50%'],
      transition: {
        ease: 'linear',
        duration: 3,
        times: [0, 0.25, 0.5, 0.75, 1],
        repeat: Infinity,
      },
    },
    initial: {
      '--r': [],
      '--x': [],
      '--y': [],
      transition: {
        ease: 'easeOut',
        duration: 1,
      },
    },
    done: {
      '--r': '0deg',
      '--x': '10%',
      transition: {
        ease: 'easeOut',
        duration: 1.5,
      },
    },
  };

  const strokeGlow = useMotionTemplate`conic-gradient(from calc(var(--r) - 55deg) at var(--x) var(--y), hsla(0, 0%, 100%, var(--opacity)) 0%, hsla(0, 0%, 100%, var(--opacity-2)) 3%, hsla(0, 0%, 100%, var(--opacity-2)) 32%, hsla(0, 0%, 100%, var(--opacity)) 35%)`;

  useEffect(() => {
    const doAnimation = async () => {
      if (status === 'initial') {
        controls.start(['strokeInvisible']);
      }

      if (status === 'done') {
        await controls.start(['strokeFull']);

        setTimeout(() => {
          controls.start(['strokeInvisible']);
        }, 4000);
      }

      if (status === 'loading') {
        controls.start(['rotate', 'strokeVisible']);
      }
    };

    doAnimation();
  }, [controls, status]);

  return (
    <Box
      css={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
      }}
    >
      <Box
        as={motion.div}
        initial={false}
        animate={controls}
        css={{
          // border shine
          position: 'absolute',
          borderRadius: 'inherit',
          zIndex: -1,
          top: -1,
          left: -1,
          width: 'calc(100% + 2px)',
          height: 'calc(100% + 2px)',
          background: 'var(--strokeGlow)',
          '--track-glow': 'var(--glow, 2px)',

          // Outer Glow
          '&:before': {
            position: 'absolute',
            content: '',
            borderRadius: 'inherit',
            width: 'inherit',
            height: 'inherit',
            top: -1,
            left: -1,
            transition: 'filter 0.5s ease',
            filter: 'blur(var(--track-glow))',
            background: 'var(--strokeGlow)',
          },
        }}
        variants={variants}
        style={{
          // @ts-ignore
          '--strokeGlow': strokeGlow,
        }}
      />
    </Box>
  );
};

export default RotatingShine;
