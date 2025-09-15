import { Box, Flex, Text } from '@maximeheckel/design-system';
import {
  motion,
  useAnimate,
  useMotionTemplate,
  useMotionValue,
} from 'motion/react';
import { useEffect, useCallback } from 'react';

export const EffectFragment = ({ enabled = true }: { enabled?: boolean }) => {
  const INIT_CLIP_PATH_VALUE = '90%';
  const INIT_TRANSFORM_VALUE = '10%';

  const [scope, animate] = useAnimate();
  const clipPathValue = useMotionValue(INIT_CLIP_PATH_VALUE);
  const transformValue = useMotionValue(INIT_TRANSFORM_VALUE);

  const clipPath = useMotionTemplate`inset(0 ${clipPathValue} 0 0)`;
  const transform = useMotionTemplate`translateX(-${transformValue})`;
  const left = useMotionTemplate`${transformValue}`;

  const stopAnimation = useCallback(() => {
    animate(clipPathValue, '50%', {
      duration: 0.0,
    });
    animate(transformValue, '50%', {
      duration: 0.0,
    });
  }, [animate, clipPathValue, transformValue]);

  const startAnimation = useCallback(async () => {
    animate(clipPathValue, ['90%', '10%'], {
      duration: 2.0,
      delay: 1.0,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
      repeatDelay: 1.0,
    });
    animate(transformValue, ['10%', '90%'], {
      duration: 2.0,
      delay: 1.0,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
      repeatDelay: 1.0,
    });
  }, [animate, clipPathValue, transformValue]);

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }
    stopAnimation();
  }, [enabled, startAnimation, stopAnimation]);

  return (
    <Flex direction="column" gap="2">
      <Box
        ref={scope}
        css={{
          width: '50dw',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 'var(--border-radius-2)',
          border: '2px solid var(--border-color)',
        }}
      >
        <Box
          as="img"
          src="https://cdn.maximeheckel.com/images/blog/effect-before.jpg"
          alt="Effect Fragment Shader"
          css={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          as={motion.div}
          css={{
            width: '2px',
            height: '100%',
            background: 'var(--border-color)',
            position: 'absolute',
            top: 0,

            zIndex: 1,
          }}
          style={{ transform, left }}
        />
        <Box
          as={motion.div}
          css={{
            position: 'absolute',
            top: 1.5,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          style={{ clipPath }}
        >
          <Box
            as="img"
            src="https://cdn.maximeheckel.com/images/blog/effect-after.jpg"
            alt="Effect Fragment Shader"
            css={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      </Box>
      <Text
        css={{ textTransform: 'uppercase' }}
        variant="primary"
        family="mono"
        size="2"
      >
        Effect Fragment Shader
      </Text>
    </Flex>
  );
};
