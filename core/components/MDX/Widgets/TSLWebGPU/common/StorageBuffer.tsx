import { Flex, Text } from '@maximeheckel/design-system';
import { useAnimate } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';

import { seededRandom } from './util';

export const StorageBuffer = ({ enabled = true }: { enabled?: boolean }) => {
  const [scope, animate] = useAnimate();

  const animationRef = useRef<any>(null);

  const randomNumArray = Array.from({ length: 9 }, (_, i) =>
    seededRandom(i + 1).toFixed(1)
  );

  const itemWidth = 35;
  const gap = 4;
  const itemsPerGroup = 3;
  const totalItems = randomNumArray.length; // Triple the array
  const groupCount = Math.ceil(totalItems / itemsPerGroup);
  const groupPadding = 4;
  const groupBorder = 4;
  const groupGap = 8;

  const itemWidthPerGroup =
    itemWidth * itemsPerGroup + gap * (itemsPerGroup - 1);
  const groupExtraWidth = groupPadding + groupBorder;
  const totalGroupWidth = itemWidthPerGroup + groupExtraWidth;
  const translateDistance =
    totalGroupWidth * groupCount + groupGap * (groupCount - 1) + 8;

  const startAnimation = useCallback(async () => {
    animationRef.current = animate(
      scope.current,
      { x: -translateDistance },
      {
        duration: 4,
        repeat: Infinity,
        ease: 'linear',
      }
    );
  }, [scope, animate, translateDistance]);

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.cancel();
    }
  };

  useEffect(() => {
    if (enabled) {
      startAnimation();
      return;
    }

    stopAnimation();
  }, [enabled, startAnimation]);

  return (
    <Flex
      direction="column"
      gap="2"
      css={{
        flexShrink: 0,
        maxWidth: 'min(45dvw, 400px)',
        overflow: 'hidden',
        maskImage:
          'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
      }}
    >
      <Text
        aria-hidden
        css={{ textTransform: 'uppercase' }}
        variant="primary"
        family="mono"
        size="2"
      >
        Storage Buffer
      </Text>
      <Flex ref={scope} gap="2">
        {Array.from(
          {
            length: Math.ceil(
              [...randomNumArray, ...randomNumArray, ...randomNumArray].length /
                3
            ),
          },
          (_, groupIndex) => {
            const startIndex = groupIndex * 3;
            const groupItems = [
              ...randomNumArray,
              ...randomNumArray,
              ...randomNumArray,
            ].slice(startIndex, startIndex + 3);

            return (
              <Flex
                key={`group-${groupIndex}`}
                css={{
                  flexShrink: 0,
                  border: '2px solid var(--accent)',
                  borderRadius: 'var(--border-radius-2)',
                  padding: '2px',
                  gap: '4px',
                }}
              >
                {groupItems.map((item, itemIndex) => {
                  const actualIndex = startIndex + itemIndex;
                  return (
                    <Flex
                      aria-hidden
                      css={{
                        flexShrink: 0,
                        height: '35px',
                        width: '35px',
                        background: 'oklch(from var(--accent) l c h / 0.75)',
                        border: '2px dashed var(--accent)',
                        borderRadius: 'var(--border-radius-1)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      key={`${item}-${actualIndex}`}
                    >
                      <Text
                        family="mono"
                        css={{ fontSize: 12 }}
                        variant="primary"
                        weight="3"
                      >
                        {item}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            );
          }
        )}
      </Flex>
    </Flex>
  );
};
