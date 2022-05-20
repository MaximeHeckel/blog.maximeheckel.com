import { Box, Card, Flex, Text } from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import { LayoutGroup, motion } from 'framer-motion';
import React from 'react';

const TabsSharedLayoutAnimation = () => {
  const [focused, setFocused] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState('Item 1');
  const tabs = ['Item 1', 'Item 2', 'Item 3'];

  return (
    <Flex
      as="ul"
      alignItems="center"
      css={{
        padding: 'var(--space-2) var(--space-4)',
        background: 'var(--maximeheckel-card-background-color)',
        borderRadius: 'var(--border-radius-1)',
        width: 'fit-content',
        border: '1px solid var(--maximeheckel-border-color)',
      }}
      gap={6}
      onMouseLeave={() => setFocused(null)}
    >
      {tabs.map((item) => (
        <Box
          as="li"
          css={{
            position: 'relative',
            listStyle: 'none',
            cursor: 'pointer',
            width: '50px',
            height: '30px',
            outline: 'none',
          }}
          key={item}
          onClick={() => setSelected(item)}
          onKeyDown={(event: { key: string }) =>
            event.key === 'Enter' ? setSelected(item) : null
          }
          onFocus={() => setFocused(item)}
          onMouseEnter={() => setFocused(item)}
          tabIndex={0}
        >
          <Text
            size="1"
            css={{
              position: 'absolute',
              left: 4,
              right: 0,
              top: 2,
              bottom: 0,
              zIndex: 1,
              userSelect: 'none',
            }}
          >
            {item}
          </Text>

          {focused === item ? (
            <Box
              as={motion.div}
              transition={{
                layout: {
                  duration: 0.2,
                  ease: 'easeOut',
                },
              }}
              css={{
                position: 'absolute',
                bottom: '-2px',
                left: '-10px',
                right: 0,
                width: '140%',
                height: '110%',
                background: 'var(--maximeheckel-colors-foreground)',
                borderRadius: 'var(--border-radius-1)',
                zIndex: 0,
              }}
              layoutId="highlight"
            />
          ) : null}
          {selected === item ? (
            <Box
              as={motion.div}
              css={{
                position: 'absolute',
                bottom: '-10px',
                left: '0px',
                right: 0,
                height: '4px',
                background: 'var(--maximeheckel-colors-brand)',
                borderRadius: 'var(--border-radius-1)',
                zIndex: 0,
              }}
              layoutId="underline"
            />
          ) : null}
        </Box>
      ))}
    </Flex>
  );
};

const TabsLayoutGroup = (props: { layoutGroup: boolean }) => {
  const { layoutGroup } = props;

  const codeString = `const Tabs = ({ id }) => {
  const [focused, setFocused]
    = React.useState(null);
  const [selected, setSelected]
    = React.useState('Item 1');
  const tabs = [
    'Item 1', 
    'Item 2', 
    'Item 3'
  ];

  return (
    <LayoutGroup id={id}>
      <Wrapper
        onMouseLeave={() => 
          setFocused(null)
        }
      >
        {tabs.map((item) => (
          <Tab {/*...*/}>
  {/* Tab implementation... */}
          </Tab>
        )}
      </Wrapper>
    </LayoutGroup>
  );`;

  return (
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body dotMatrix>
        <Flex direction="column" gap="4">
          {layoutGroup ? (
            <>
              <LayoutGroup id="tab1">
                <TabsSharedLayoutAnimation />
              </LayoutGroup>
              <LayoutGroup id="tab2">
                <TabsSharedLayoutAnimation />
              </LayoutGroup>
            </>
          ) : (
            <>
              <TabsSharedLayoutAnimation />
              <TabsSharedLayoutAnimation />
            </>
          )}
        </Flex>
      </Card.Body>
      {layoutGroup ? (
        <HighlightedCodeText codeString={codeString} language="jsx" />
      ) : null}
    </Card>
  );
};

export default TabsLayoutGroup;
