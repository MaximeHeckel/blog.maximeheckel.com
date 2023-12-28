/* eslint-disable react/no-unescaped-entities */
import { Box, styled, Anchor, Grid, H1, H3 } from '@maximeheckel/design-system';
import { DefaultSeo } from '@core/components/Seo';
import Link from 'next/link';
import siteConfig from '../config/site';
import { templateColumnsMedium } from 'styles/grid';

const Wrapper = styled(Box, {
  margin: '0 auto',
  maxWidth: '1430px',
  display: 'flex',
  height: 'calc(100vh)',
  alignItems: 'center',
  color: 'var(--text-primary)',
});

const NotFoundPage = () => (
  <Grid gapX={4} templateColumns={templateColumnsMedium}>
    <DefaultSeo title={`404: Not found - ${siteConfig.title}`} />
    <Grid.Item as={Wrapper} col={2}>
      <Box>
        <H1>404 Not Found</H1>
        <H3>
          Oh no! You just got lost 😱! <br />
          Don't worry I got you!{' '}
          <Link href="/" legacyBehavior passHref>
            <Anchor underline>Click here</Anchor>
          </Link>{' '}
          to go back home.
        </H3>
      </Box>
    </Grid.Item>
  </Grid>
);

export default NotFoundPage;
