import {
  Button,
  Card,
  Checkbox,
  Flex,
  Icon,
  Text,
  Tooltip,
} from '@maximeheckel/design-system';
import { AnimatePresence, LayoutGroup, motion, Reorder } from 'framer-motion';
import { css, styled } from '@maximeheckel/design-system';
import React from 'react';

const HR = styled('hr', {
  height: '2px',
  width: '100%',
  background: 'hsl(var(--palette-gray-20))',
  border: 'none',
  marginBottom: '16px',
});

const ITEMS = [
  {
    text: 'Finish blog post ✍️',
    checked: false,
    id: 1,
  },
  {
    text: 'Build new Three.js experiences ✨',
    checked: false,
    id: 2,
  },
  {
    text: 'Add new components to Design System 🌈',
    checked: false,
    id: 3,
  },
  {
    text: 'Make some coffee ☕️',
    checked: false,
    id: 4,
  },
  {
    text: 'Drink water 💧',
    checked: false,
    id: 5,
  },
  {
    text: 'Go to the gym 🏃‍♂️',
    checked: false,
    id: 6,
  },
];

const AdvanceReorderExample = () => {
  const [items, setItems] = React.useState(ITEMS);

  const completeItem = (id: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          checked: !item.checked,
        };

        return updatedItem;
      }

      return item;
    });

    setItems(updatedItems);
  };

  return (
    <Card
      depth={1}
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body css={{ height: '640px' }}>
        <Flex direction="column" gap="4" alignItems="start">
          <Flex gap={4}>
            <Button
              variant="secondary"
              disabled={items.length > 5}
              onClick={() =>
                setItems((prev) => {
                  return [
                    ...prev,
                    {
                      text: 'Prepare for space travel 🧑‍🚀',
                      id: Math.random(),
                      checked: false,
                    },
                  ];
                })
              }
            >
              Add item
            </Button>
            <Tooltip id="tooltip-reset-list" content="Reset task list">
              <Button
                variant="icon"
                onClick={() => setItems(ITEMS)}
                icon={<Icon.Repeat />}
              />
            </Tooltip>
          </Flex>
          <LayoutGroup>
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={setItems}
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                margin: '0',
                padding: '0',
                width: '100%',
              })()}
            >
              <AnimatePresence>
                {items.map((item) => (
                  <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    key={item.id}
                    as={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    gap="6"
                  >
                    <Card
                      as={Reorder.Item}
                      css={{
                        listStyle: 'none',
                        cursor: 'grab',
                        height: '100%',
                        flexGrow: 1,
                      }}
                      style={{
                        position: 'relative', // /!\ this is needed to avoid weird overlap
                        borderRadius: '12px',
                        width: item.checked ? '70%' : '100%', // layout resize animation
                      }}
                      depth={1}
                      value={item}
                    >
                      <Card.Body
                        as={motion.div}
                        layout="position"
                        css={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-4)',
                          padding: 'var(--space-4)',
                        }}
                      >
                        <Checkbox
                          id={`checkbox-${item.id}`}
                          aria-label="Mark as done"
                          checked={item.checked}
                          onChange={() => completeItem(item.id)}
                        />
                        <Text
                          size="2"
                          css={{
                            marginBottom: 0,
                          }}
                        >
                          {item.text}
                        </Text>
                      </Card.Body>
                    </Card>
                    <AnimatePresence initial={false}>
                      {item.checked ? (
                        <motion.div
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: { delay: 0.2 } }}
                          exit={{ opacity: 0 }}
                        >
                          <Button
                            variant="icon"
                            icon={<Icon.X />}
                            onClick={() =>
                              setItems((prev) =>
                                prev.filter((task) => task.id !== item.id)
                              )
                            }
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </Flex>
                ))}
              </AnimatePresence>
            </Reorder.Group>
            <motion.div layout>
              <HR />
              <Text size={2}>
                Check items off the list when you&apos;re done!
              </Text>
            </motion.div>
          </LayoutGroup>
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default AdvanceReorderExample;
