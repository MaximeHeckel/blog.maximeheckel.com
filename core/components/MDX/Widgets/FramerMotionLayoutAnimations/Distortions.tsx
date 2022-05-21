import { Box, Card, Flex, Switch } from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import { motion } from 'framer-motion';
import React from 'react';

const Distortions = () => {
  const [expanded, setExpanded] = React.useState(false);
  const [inline, setInline] = React.useState(false);
  const codeString = inline
    ? `// expanded: ${expanded}

// CSS
.box {
  width: 20px;
  height: 20px;
}

.box[data-expanded="true"] {
  width: 150px;
  height: 150px;
}
  
// JS
<motion.div
  layout
  className="box"
  data-expanded={expanded}
  style={{
    borderRadius: '20px'
  }}
/>`
    : `// expanded: ${expanded}

// CSS
.box {
  width: 20px;
  height: 20px;
  border-radius: 20px;
}

.box[data-expanded="true"] {
  width: 150px;
  height: 150px;
}
  
// JS
<motion.div
  layout
  className="box"
  data-expanded={expanded}
/>

`;

  return (
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body dotMatrix css={{ height: '300px', display: 'grid' }}>
        <Box
          as={motion.div}
          // @ts-ignore
          key={inline}
          layout
          transition={{
            layout: {
              duration: 1.5,
            },
          }}
          css={{
            justifySelf: 'center',
            alignSelf: 'center',
            background:
              'linear-gradient(-60deg,#2E83FF -10%,#EB7D9F 50%, #FFCBBE 100%)',
            width: expanded ? '150px' : '20px',
            height: expanded ? '150px' : '20px',
            borderRadius: '16px',
          }}
          style={
            inline
              ? {
                  borderRadius: '16px',
                }
              : {}
          }
        />
        <Box
          css={{
            position: 'absolute',
            bottom: '0',
            width: '100%',
            padding: 'var(--space-4)',
          }}
        >
          <Flex alignItems="center" justifyContent="center">
            <Switch
              aria-label="Expand card"
              id="expand-card-distort"
              label="Expand card"
              onChange={() => setExpanded((prev) => !prev)}
            />
            <Switch
              aria-label="Set distorted properties inline"
              id="distort"
              label="Set distorted properties inline"
              onChange={() => setInline((prev) => !prev)}
            />
          </Flex>
        </Box>
      </Card.Body>
      <HighlightedCodeText language="jsx" codeString={codeString} />
    </Card>
  );
};

export default Distortions;
