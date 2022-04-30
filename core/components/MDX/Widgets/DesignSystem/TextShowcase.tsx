import { Flex, Text } from '@maximeheckel/design-system';
import Card from '@theme/components/Card';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import React from 'react';

const TextShowcase = () => {
  const codeString = `const App = () => {
  return (
    <>
      <Text outline size="6">
        Almost before we knew it,
        we had left the ground.
      </Text>
      <Text truncate>
        Almost before we knew it,
        we had left the ground.
      </Text>
      <Text
        gradient
        css={{
          backgroundImage: 
            'linear-gradient(...)',
        }}
        size="6"
        weight="4"
      >
        Almost before we knew it,
        we had left the ground.
      </Text>
    </>
  );
};`;

  return (
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body
        as={Flex}
        alignItems="start"
        direction="column"
        dotMatrix
        gap="4"
      >
        <Text css={{ marginBottom: 0 }} family="numeric" outline size="7">
          Almost before we knew it, we had left the ground.
        </Text>
        <Flex css={{ maxWidth: 250 }}>
          <Text css={{ marginBottom: 0 }} truncate>
            Almost before we knew it, we had left the ground.
          </Text>
        </Flex>
        <Text
          gradient
          css={{
            marginBottom: 0,
            backgroundImage: `linear-gradient(90deg,#2E83FF -10%,#EB7D9F 50%, #FFCBBE 100%)`,
          }}
          size="6"
          weight="4"
        >
          Almost before we knew it, we had left the ground.
        </Text>
      </Card.Body>
      <HighlightedCodeText codeString={codeString} language="jsx" />
    </Card>
  );
};

export default TextShowcase;
