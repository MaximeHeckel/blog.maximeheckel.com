import { Box, Card, Flex, Grid } from '@maximeheckel/design-system';
import { HighlightedCodeText } from '@core/components/Code/CodeBlock';
import React from 'react';

const StyledBox = () => (
  <Box
    css={{
      height: 100,
      width: 100,
      borderRadius: 'var(--border-radius-2)',
      background: 'white',
      backgroundImage:
        'radial-gradient(at 30% 20%, var(--blue-600) 0px, transparent 50%), radial-gradient(at 80% -10%, var(--blue-700) 0px, transparent 50%), radial-gradient(at 70% 50%, var(--pink-500) 0px, transparent 50%), radial-gradient(at -10% 90%, hsl(from var(--emphasis) h s l / 80%) 0px, transparent 50%), radial-gradient(at 80% 110%, hsl(from var(--danger-emphasis) h s l / 40%) 0px, transparent 50%), radial-gradient(at 0% 0%, hsl(from var(--danger-emphasis) h s l / 60%) 0px, transparent 50%)',
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
      <Grid gap="4" templateColumns="repeat(2, 1fr)">
        <Box css={...} />
        <Box css={...} />
        <Box css={...} />
        <Box css={...} />
      </Grid>
    </>
  );
};`;

  return (
    <Card css={{ width: '100%', display: 'grid' }}>
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
        <Grid gap="4" templateColumns="repeat(2, 1fr)">
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
