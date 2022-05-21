import {
  css,
  Card,
  Flex,
  Icon,
  Pill,
  Text,
  Switch,
} from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import React from 'react';

const ITEMS = [
  {
    text: 'Make some coffee ☕️',
    id: 1,
  },
  {
    text: 'Drink water 💧',
    id: 2,
  },
  {
    text: 'Go to the gym 🏃‍♂️',
    id: 3,
  },
];

const ITEMS2 = [
  {
    text: 'Finish blog post ✍️',
    id: 1,
  },
  {
    text: 'Build new Three.js experiences ✨',
    id: 2,
  },
  {
    text: 'Add new components to Design System 🌈',
    id: 3,
  },
];

const List = (props: {
  items: Array<{ text: string; id: number }>;
  name: string;
}) => {
  const { items, name } = props;
  const [listItems, setListItems] = React.useState(items);

  return (
    <Flex direction="column" gap="4" alignItems="start" css={{ width: '100%' }}>
      <AnimatePresence>
        {listItems.map((item) => (
          <Card
            as={motion.div}
            layout
            initial={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            key={item.id}
            css={{
              width: '100%',
              borderRadius: 'var(--border-radius-1)',
            }}
          >
            <Card.Body
              css={{
                padding: 'var(--space-3)',
              }}
            >
              <Flex alignItems="center" gap="4">
                <button
                  className={css({
                    height: '16px',
                    width: '16px',
                    background: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                    color: 'var(--maximeheckel-colors-typeface-secondary)',
                    cursor: 'pointer',
                  })()}
                  onClick={() =>
                    setListItems((prev) =>
                      prev.filter((task) => task.id !== item.id)
                    )
                  }
                >
                  <Icon.X size="4" />
                </button>
                <Text
                  size="2"
                  css={{
                    marginBottom: 0,
                    userSelect: 'none',
                  }}
                >
                  {item.text} <Pill variant="info">{name}</Pill>
                </Text>
              </Flex>
            </Card.Body>
          </Card>
        ))}
      </AnimatePresence>
    </Flex>
  );
};

const ListLayoutGroup = () => {
  const [layoutGroup, setLayoutGroup] = React.useState(false);

  const codeString = layoutGroup
    ? `<LayoutGroup>
  <List 
    items={[...]} 
    name="List 1" 
  />
  <List 
    items={[...]}
    name="List 2"
  />
</LayoutGroup>`
    : `<>
  <List
    items={[...]}
    name="List 1"
  />
  <List
    items={[...]}
    name="List 2"
  />
</>`;

  return (
    <Card
      depth={1}
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body
        css={{
          height: '520px',
        }}
      >
        <Flex alignItems="start" direction="column" gap="3">
          <Flex alignItems="center" gap="4">
            <Switch
              aria-label="Wrap in LayoutGroup"
              id="use-layoutGroup"
              label="Wrap in LayoutGroup"
              onChange={() => setLayoutGroup((prev) => !prev)}
            />
          </Flex>
          {layoutGroup ? (
            <LayoutGroup>
              <List items={ITEMS} name="List 1" />
              <List items={ITEMS2} name="List 2" />
            </LayoutGroup>
          ) : (
            <>
              <List items={ITEMS} name="List 1" />
              <List items={ITEMS2} name="List 2" />
            </>
          )}
        </Flex>
      </Card.Body>
      <HighlightedCodeText codeString={codeString} language="jsx" />
    </Card>
  );
};

export default ListLayoutGroup;
