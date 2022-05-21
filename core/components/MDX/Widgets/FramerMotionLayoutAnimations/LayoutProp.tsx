import { Box, Card, Flex, Grid, Switch } from '@maximeheckel/design-system';
import { motion } from 'framer-motion';
import React from 'react';

const LayoutProp = () => {
  const [expanded, setExpanded] = React.useState(true);

  // layout false => no transition / new size + new position
  // layout true => size + position
  // layout position => just the position / new size instantly
  // layout size => just the size / moves to position instantly

  return (
    <Box
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Box
        css={{
          margin: '30px 0px',

          '@media (min-width: 1100px)': {
            position: 'relative',
            maxWidth: '1000px',
            width: 'calc(100% + 300px)',
            margin: '30px -150px',
          },
        }}
      >
        <Grid
          css={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
          gap="6"
        >
          <Card glass depth={3} title="layout={true}">
            <Card.Body dotMatrix css={{ height: '300px', display: 'grid' }}>
              <Box
                as={motion.div}
                layout
                transition={{
                  layout: {
                    duration: 1.5,
                  },
                }}
                css={{
                  justifySelf: expanded ? 'center' : 'flex-start',
                  alignSelf: expanded ? 'center' : 'flex-start',
                  background:
                    'linear-gradient(-60deg,#2E83FF -10%,#EB7D9F 50%, #FFCBBE 100%)',
                  width: expanded ? '20px' : '100%',
                  height: expanded ? '20px' : '100%',
                }}
                style={{
                  borderRadius: 20,
                }}
              />
            </Card.Body>
          </Card>
          <Card glass depth={3} title='layout="position"'>
            <Card.Body dotMatrix css={{ height: '300px', display: 'grid' }}>
              <Box
                as={motion.div}
                layout="position"
                transition={{
                  layout: {
                    duration: 1.5,
                  },
                }}
                css={{
                  justifySelf: expanded ? 'center' : 'flex-start',
                  alignSelf: expanded ? 'center' : 'flex-start',
                  background:
                    'linear-gradient(-60deg,#2E83FF -10%,#EB7D9F 50%, #FFCBBE 100%)',
                  width: expanded ? '20px' : '100%',
                  height: expanded ? '20px' : '100%',
                }}
                style={{
                  borderRadius: 20,
                }}
              />
            </Card.Body>
          </Card>
          <Card glass depth={3} title='layout="size"'>
            <Card.Body dotMatrix css={{ height: '300px', display: 'grid' }}>
              <Box
                as={motion.div}
                layout="size"
                transition={{
                  layout: {
                    duration: 1.5,
                  },
                }}
                css={{
                  justifySelf: expanded ? 'center' : 'flex-start',
                  alignSelf: expanded ? 'center' : 'flex-start',
                  background:
                    'linear-gradient(-60deg,#2E83FF -10%,#EB7D9F 50%, #FFCBBE 100%)',
                  width: expanded ? '20px' : '100%',
                  height: expanded ? '20px' : '100%',
                }}
                style={{
                  borderRadius: 20,
                }}
              />
            </Card.Body>
          </Card>
        </Grid>
      </Box>
      <Flex justifyContent="center">
        <Switch
          aria-label="Expand card"
          id="expand-card"
          label="Expand card"
          onChange={() => setExpanded((prev) => !prev)}
        />
      </Flex>
    </Box>
  );
};
export default LayoutProp;
