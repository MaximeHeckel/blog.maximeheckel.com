import { Card, Flex, Text } from '@maximeheckel/design-system';
import React from 'react';

import { HighlightedCodeText } from '@core/components/Code/CodeBlock';

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
    <Card>
      <Card.Body
        as={Flex}
        alignItems="start"
        direction="column"
        dotMatrix
        gap="4"
      >
        <Text family="mono" outline size="7">
          Almost before we knew it, we had left the ground.
        </Text>
        <Flex css={{ maxWidth: 250 }}>
          <Text truncate>
            Almost before we knew it, we had left the ground.
          </Text>
        </Flex>
      </Card.Body>
      <HighlightedCodeText codeString={codeString} language="jsx" />
    </Card>
  );
};

export default TextShowcase;
