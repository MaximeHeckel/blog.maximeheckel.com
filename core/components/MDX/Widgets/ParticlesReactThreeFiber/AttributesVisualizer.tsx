import {
  Box,
  Button,
  Card,
  Flex,
  Icon,
  Tooltip,
} from '@maximeheckel/design-system';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

const START_PX = 280;
const DIMENSION_ARRAY_ITEM = 40;
const ITEM_SIZE = 3;
const LABEL = 'Vertex';

const AttributesVisualizer = () => {
  const [currentIndex, setIndex] = useState(0);
  const [randomMatrix, setRandomMatrix] = useState<string[][]>([]);

  const flattenItems = randomMatrix.flat();
  const currentPoint = Math.floor(currentIndex / ITEM_SIZE);

  // Need to do this in useEffect so we avoid mismatch of math.random between SSR and client
  useEffect(() => {
    const generatedArray = Array(8)
      .fill(null)
      .map(() =>
        Array.from(Array(ITEM_SIZE)).map(() =>
          (Math.random() * (9.9 - 0.0)).toFixed(1)
        )
      );
    setRandomMatrix(generatedArray);
  }, []);

  return (
    <Card title="Position attributes array to vertex visualizer">
      <Card.Body>
        <Box
          css={{
            height: 50,
          }}
        >
          <Flex
            as={motion.div}
            initial={{
              x: START_PX,
            }}
            animate={{
              x: START_PX - currentIndex * DIMENSION_ARRAY_ITEM,
            }}
            transition={{
              ease: 'easeInOut',
              delay: 0,
            }}
            justifyContent="center"
            css={{
              position: 'absolute',
              gap: 0,
            }}
          >
            {flattenItems.map((item, index) => (
              <Flex
                alignItems="center"
                direction="column"
                key={`${item}-${index}`}
                css={{
                  padding: 'var(--space-2)',
                  width: DIMENSION_ARRAY_ITEM,
                  height: DIMENSION_ARRAY_ITEM,
                  boxShadow:
                    index === currentIndex
                      ? '0 2px 20px -2px var(--input-focus)'
                      : 'none',
                  borderColor:
                    index === currentIndex
                      ? 'var(--input-active)'
                      : 'var(--border-color)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderLeftWidth:
                    index === 0 || index === currentIndex ? '2px' : 0,
                  transition: 'box-shadow 0.2s border-color 0.2s',
                }}
                justifyContent="center"
              >
                <Box
                  as={motion.div}
                  css={{
                    fontFamily: 'var(--font-numeric)',
                    fontSize: 'var(--font-size-1)',
                    fontWeight: 'var(--font-weight-600)',
                  }}
                  initial={{ y: 0 }}
                  animate={{
                    y: currentIndex > index ? 50 : 0,
                    opacity: currentPoint > index / ITEM_SIZE ? 0 : 1,
                  }}
                  transition={{
                    opacity: {
                      delay: 0.15,
                      duration: 0.2,
                    },
                  }}
                >
                  {item}
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>
        <Box css={{ height: 120 }}>
          <Flex
            as={motion.div}
            initial={{ x: START_PX - ITEM_SIZE * DIMENSION_ARRAY_ITEM }}
            animate={{
              x:
                START_PX -
                ITEM_SIZE * DIMENSION_ARRAY_ITEM -
                // Skip translating when we reach the end of the array
                (currentIndex <= flattenItems.length - 1
                  ? currentPoint * (ITEM_SIZE * DIMENSION_ARRAY_ITEM + 4 + 20)
                  : (currentPoint - 1) *
                    (ITEM_SIZE * DIMENSION_ARRAY_ITEM + 4 + 20)),
            }}
            css={{
              position: 'absolute',
            }}
            gap="5"
            transition={{
              x: {
                delay: 0.8,
                ease: 'easeInOut',
              },
            }}
          >
            {randomMatrix.map((item, index) => (
              <Box
                css={{ position: 'relative', zIndex: 1 }}
                key={`${item.join(',')}-${index}`}
              >
                <Flex
                  as={motion.div}
                  css={{
                    background: 'var(--emphasis)',
                    color: 'var(--accent)',
                    border: '2px solid var(--accent)',
                    borderRadius: 'var(--border-radius-1)',
                    height: 40,
                    width: ITEM_SIZE * DIMENSION_ARRAY_ITEM,
                  }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: currentPoint >= index + 1 ? 1 : 0,
                    y: currentPoint >= index + 1 ? 50 : 0,
                  }}
                  justifyContent="center"
                  transition={{
                    opacity: {
                      delay: currentPoint >= index + 1 ? 0.15 : 0,
                    },
                    y: {
                      delay: 0.4,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  {item.map((subItem, subIndex) => (
                    <React.Fragment key={`${subItem}-${subIndex}`}>
                      <Box
                        css={{
                          position: 'absolute',
                          borderRadius: 'var(--border-radius-1)',
                          padding: '4px 6px',
                          background: 'var(--accent)',
                          color: 'var(--background)',
                          fontSize: 'var(--font-size-1)',
                          fontWeight: 'var(--font-weight-500)',
                          userSelect: 'none',
                          top: -24,
                          left: -20,
                        }}
                      >
                        {LABEL} {index + 1}
                      </Box>
                      <Box
                        css={{
                          padding: 'var(--space-2)',
                          fontFamily: 'var(--font-numeric)',
                          fontSize: 'var(--font-size-1)',
                          fontWeight: 'var(--font-weight-600)',
                        }}
                      >
                        {subItem}
                      </Box>
                    </React.Fragment>
                  ))}
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
        <Flex gap={3} justifyContent="center">
          <Tooltip content="Reset">
            <Button
              icon={<Icon.Repeat />}
              onClick={() => {
                setIndex(0);
              }}
              variant="icon"
            />
          </Tooltip>
          <Tooltip content="Next step">
            <Button
              icon={<Icon.Arrow />}
              onClick={() => {
                setIndex((prev) => {
                  if (prev + 1 > flattenItems.length) {
                    return prev;
                  }

                  return prev + 1;
                });
              }}
              variant="icon"
            />
          </Tooltip>
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default AttributesVisualizer;
