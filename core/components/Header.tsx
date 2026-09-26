import { Box, Grid } from '@maximeheckel/design-system';

import { Dock } from '@core/components/Dock';

const Header = () => {
  return (
    <Box
      as="header"
      css={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        marginTop: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <Grid templateColumns="auto 1fr auto" gapY={2}>
        <Grid.Item col={2} justifySelf="center">
          <Dock />
        </Grid.Item>
      </Grid>
    </Box>
  );
};

export { Header };
