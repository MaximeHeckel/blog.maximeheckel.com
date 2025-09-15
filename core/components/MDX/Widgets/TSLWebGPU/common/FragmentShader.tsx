import { Flex, Text } from '@maximeheckel/design-system';
import { useAnimate } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';

const staticBlocks = [
  '0-0',
  '1-0',
  '2-0',
  '3-0',
  '5-0',
  '0-1',
  '5-1',
  '5-2',
  '0-10',
  '0-11',
  '0-12',
  '1-10',
  '1-11',
  '2-10',
  '2-11',
  '3-11',
  '4-11',
];

export const FragmentShader = ({ enabled = true }: { enabled?: boolean }) => {
  const [scope, animate] = useAnimate();
  const animationsRef = useRef<any[]>([]);

  const fragmentBlockArray = Array.from({ length: 6 }, () =>
    Array.from({ length: 12 }, () => null)
  );

  const startAnimation = useCallback(async () => {
    const rects = scope.current?.querySelectorAll('rect[data-animate]');
    if (rects) {
      const animations: any[] = [];

      rects.forEach((rect: any) => {
        const rowIndex = parseInt(rect.getAttribute('data-row') || '0');
        const blockIndex = parseInt(rect.getAttribute('data-block') || '0');
        const isStatic = staticBlocks.includes(`${rowIndex}-${blockIndex}`);

        if (!isStatic) {
          // unset fill property
          rect.removeAttribute('style');

          // Reset to initial state before starting animation
          rect.setAttribute('fill', '#D9D9D9');

          const animation = animate(
            rect,
            { fill: ['#D9D9D9', '#5786F5'] },
            {
              delay: rowIndex * 0.1 + blockIndex * 0.1 + 1.0,
              duration: 1.0,
              repeat: Infinity,
              repeatType: 'mirror',
              repeatDelay: 1.5,
              ease: 'easeInOut',
            }
          );

          animations.push(animation);
        }
      });

      animationsRef.current = animations;
    }
  }, [scope, animate]);

  const stopAnimation = useCallback(() => {
    if (animationsRef.current.length === 0) {
      return;
    }

    animationsRef.current.forEach((animation) => {
      if (animation) {
        animation.cancel();
      }
    });
    animationsRef.current = [];

    // Set final state when stopping animation
    const rects = scope.current?.querySelectorAll('rect[data-animate]');
    if (rects) {
      rects.forEach((rect: any) => {
        const rowIndex = parseInt(rect.getAttribute('data-row') || '0');
        const blockIndex = parseInt(rect.getAttribute('data-block') || '0');
        const isStatic = staticBlocks.includes(`${rowIndex}-${blockIndex}`);

        if (!isStatic) {
          // Ensure the fill is set to the target color
          rect.style.fill = '#5786F5';
        }
      });
    }
  }, [scope]);

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }
    stopAnimation();

    return () => {
      stopAnimation();
    };
  }, [enabled, startAnimation, stopAnimation]);

  return (
    <Flex
      justifyContent="center"
      direction="column"
      gap="2"
      css={{
        flexShrink: 0,
      }}
    >
      <svg
        ref={scope}
        width="min(40dvw, 266px)"
        height="auto"
        viewBox="0 0 133 67"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {fragmentBlockArray.map((row, rowIndex) =>
          row.map((_, blockIndex) => {
            const isStatic = staticBlocks.includes(`${rowIndex}-${blockIndex}`);
            return (
              <rect
                key={`${rowIndex}-${blockIndex}`}
                data-animate={!isStatic}
                data-row={rowIndex}
                data-block={blockIndex}
                x={1 + blockIndex * 10}
                y={1 + rowIndex * 10}
                width="10"
                height="10"
                rx="1.5"
                stroke="white"
                fill="#D9D9D9"
              />
            );
          })
        )}
      </svg>
      <Text
        css={{ textTransform: 'uppercase' }}
        variant="primary"
        family="mono"
        size="2"
      >
        Fragment Shader
      </Text>
    </Flex>
  );
};
