import { Box, Card, Flex, Radio, Switch } from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import { motion } from 'framer-motion';
import React from 'react';

const Basic = () => {
  const [position, setPosition] = React.useState('start');
  const [layout, setLayout] = React.useState(false);

  const codeString = layout
    ? `// position: ${position}
    
<motion.div
  layout
  style={{
    justifySelf: position,
  }}
  //...
/>`
    : `// position: ${position}
    
<motion.div
  style={{
    justifySelf: position,
  }}
  //...
/>
`;

  return (
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body dotMatrix>
        <Flex direction="column" gap="5" css={{ width: '100%' }}>
          <Box
            css={{
              display: 'grid',
              width: '100%',
            }}
          >
            <Box
              as={motion.div}
              // @ts-ignore
              key={layout}
              layout={layout}
              css={{
                width: '100px',
                height: '100px',
                background:
                  'linear-gradient(-60deg,#2E83FF -10%,#EB7D9F 50%, #FFCBBE 100%)',
                borderRadius: 'var(--border-radius-2)',
                justifySelf: position,
              }}
            />
          </Box>
          <Flex direction="column" gap="4" alignItems="start">
            <Radio.Group
              name="positions"
              direction="horizontal"
              onChange={(event) => {
                // @ts-ignore
                setPosition(event.target.value);
              }}
            >
              <Radio.Item
                id="position-1"
                value="start"
                aria-label="Start"
                label="Start"
                checked={position === 'start'}
              />
              <Radio.Item
                id="position-2"
                value="center"
                aria-label="Center"
                label="Center"
                checked={position === 'center'}
              />
              <Radio.Item
                id="position-3"
                value="end"
                aria-label="End"
                label="End"
                checked={position === 'end'}
              />
            </Radio.Group>
            <Switch
              aria-label="Use layout animation"
              id="use-layout"
              label="Use layout animation"
              onChange={() => setLayout((prev) => !prev)}
            />
          </Flex>
        </Flex>
      </Card.Body>
      <HighlightedCodeText codeString={codeString} language="jsx" />
    </Card>
  );
};

export default Basic;
