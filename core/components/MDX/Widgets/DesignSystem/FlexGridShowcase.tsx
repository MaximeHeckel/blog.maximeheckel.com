import { Box, Card, Flex, Grid } from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@theme/components/Code/CodeBlock';
import React from 'react';

const StyledBox = () => (
  <Box
    css={{
      height: 100,
      width: 100,
      borderRadius: 'var(--border-radius-2)',
      background: 'white',
      backgroundImage:
        'radial-gradient(at 30% 20%, hsl(var(--palette-indigo-20)) 0px, transparent 50%), radial-gradient(at 80% -10%, hsl(var(--palette-blue-40)) 0px, transparent 50%), radial-gradient(at 70% 50%, hsl(var(--palette-pink-25)) 0px, transparent 50%), radial-gradient(at -10% 90%, hsl(var(--palette-blue-25)) 0px, transparent 50%), radial-gradient(at 80% 110%, hsl(var(--palette-red-25)) 0px, transparent 50%), radial-gradient(at 0% 0%, hsl(var(--palette-red-25)) 0px, transparent 50%)',
    }}
  />
);

const FlexGridShowcase = () => {
  const codeString = `const App = () => {
  return (
    <>
      <Flex
        alignItems="center"
        direction="column"
        justifyContent="center"
        gap="2"
      >
        <Box css={...} />
        <Box css={...} />
      </Flex>
      <Grid columns="2" gap="4">
        <Box css={...} />
        <Box css={...} />
        <Box css={...} />
        <Box css={...} />
      </Grid>
    </>
  );
};`;

  return (
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body as={Flex} direction="column" dotMatrix gap="6">
        <Flex
          alignItems="center"
          direction="column"
          justifyContent="center"
          gap="2"
        >
          <StyledBox />
          <StyledBox />
        </Flex>
        <Grid columns="2" gap="4">
          <StyledBox />
          <StyledBox />
          <StyledBox />
          <StyledBox />
        </Grid>
      </Card.Body>
      <HighlightedCodeText codeString={codeString} language="jsx" />
    </Card>
  );
};

export default FlexGridShowcase;
