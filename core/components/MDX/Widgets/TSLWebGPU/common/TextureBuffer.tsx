import { Flex, Text } from '@maximeheckel/design-system';
import { AnimationPlaybackControls, useAnimate } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';

import { seededRandom } from './util';

export const TextureBuffer = ({ enabled = true }: { enabled?: boolean }) => {
  const [scope, animate] = useAnimate();
  const animationRef = useRef<AnimationPlaybackControls[] | undefined>(
    undefined
  );

  const randomNumArray = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) =>
      seededRandom(row * 9 + col + 1).toFixed(1)
    )
  );

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.forEach((animation: AnimationPlaybackControls) => {
        animation.cancel();
      });
      animationRef.current = undefined;

      // Reset all items to default state using animate
      const items = scope.current?.querySelectorAll('div[data-animate]');
      if (items) {
        items.forEach((item: HTMLElement) => {
          // Use animate to properly set the final values
          animate(item, { opacity: 1, scale: 1 }, { duration: 0 });
        });
      }
    }
  }, [scope, animate]);

  const startAnimation = useCallback(async () => {
    const animations: AnimationPlaybackControls[] | undefined = [];
    const items = scope.current?.querySelectorAll('div[data-animate]');

    if (items) {
      items.forEach((item: HTMLElement, index: number) => {
        // Calculate row and column from the index (9x9 grid)
        const rowIndex = Math.floor(index / 9);
        const colIndex = index % 9;

        const animation = animate(
          item,
          { opacity: [0, 1], scale: [0.8, 1.25, 1.0] },
          {
            delay: rowIndex * 0.25 + colIndex * 0.25 + 1.0,
            duration: 0.75,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            repeatDelay: 5.0,
          }
        );
        animations.push(animation);
      });
    }

    animationRef.current = animations;
  }, [scope, animate]);

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }
    stopAnimation();
  }, [enabled, startAnimation, stopAnimation]);

  return (
    <Flex direction="column" gap="2">
      <Text
        css={{ textTransform: 'uppercase' }}
        variant="primary"
        family="mono"
        size="2"
      >
        Texture Buffer
      </Text>
      <Flex
        ref={scope}
        alignItems="center"
        justifyContent="center"
        css={{
          width: '275px',
          height: '275px',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--border-radius-2)',
          padding: '2px',
          overflow: 'hidden',
        }}
        wrap="wrap"
      >
        {randomNumArray.map((row, rowIndex) =>
          row.map((item, colIndex) => (
            <Flex
              key={`${rowIndex}-${colIndex}`}
              data-animate
              alignItems="center"
              justifyContent="center"
              css={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
              }}
              style={{
                border: `0.5px dashed ${
                  Number(item) > 0.66
                    ? 'oklch(from var(--accent) l c h / 1)'
                    : Number(item) > 0.33
                      ? 'oklch(from var(--blue-900) l c h / 1)'
                      : 'oklch(from var(--blue-700) l c h / 1)'
                }`,
                background:
                  Number(item) > 0.66
                    ? 'oklch(from var(--blue-800) l c h / 0.65)'
                    : Number(item) > 0.33
                      ? 'oklch(from var(--blue-900) l c h / 0.65)'
                      : 'oklch(from var(--blue-700) l c h / 0.65)',
              }}
            >
              <Text
                aria-hidden
                css={{ textTransform: 'uppercase', fontSize: '10px' }}
                variant="primary"
                family="mono"
              >
                {item}
              </Text>
            </Flex>
          ))
        )}
      </Flex>
    </Flex>
  );
};
