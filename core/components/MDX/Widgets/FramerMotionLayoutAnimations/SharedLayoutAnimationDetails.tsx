import { Box, Card, Flex, Icon } from '@maximeheckel/design-system';
import { motion } from 'motion/react';
import React from 'react';

import { Slider } from '@core/components/Slider';

const ITEMS = [1, 2, 3];
const COLORS = ['var(--accent)', 'var(--pink-500)', 'var(--orange-900)'];

const SharedLayoutAnimationDetails = () => {
  const [selected, setSelected] = React.useState(1);
  const [duration, setDuration] = React.useState(0.9);

  return (
    <Card title="Little shared layout animation debugger">
      <Card.Body>
        <Flex direction="column" gap="5">
          <Flex css={{ marginTop: '24px' }} gap="5" alignItems="start">
            {ITEMS.map((item, index) => (
              <Flex
                key={item}
                direction="column"
                justifyContent="space-between"
                css={{
                  cursor: 'pointer',
                  '&:focus': { outline: 'none' },
                  '&:focus-visible': {
                    outline: '1px solid var(--accent)',
                  },
                }}
                onClick={() => setSelected(item)}
                onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) =>
                  event.key === 'Enter' && setSelected(item)
                }
                tabIndex={0}
              >
                <Box css={{ height: '24px' }}>Item {item}</Box>
                {item === selected ? (
                  <Box
                    as={motion.div}
                    css={{ height: '24px' }}
                    layoutId="arrow"
                    transition={{
                      layout: {
                        duration,
                      },
                    }}
                  >
                    <Icon.Arrow
                      style={{
                        color: COLORS[index],
                        transform: 'rotate(-90deg)',
                      }}
                    />
                  </Box>
                ) : null}
              </Flex>
            ))}
          </Flex>
          <Flex css={{ width: '70%' }} justifyContent="center">
            <Slider
              id="duration"
              label="Duration"
              aria-label="Duration"
              min={0.2}
              max={2.0}
              step={0.1}
              value={duration}
              onChange={(value) => setDuration(value)}
            />
          </Flex>
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default SharedLayoutAnimationDetails;
