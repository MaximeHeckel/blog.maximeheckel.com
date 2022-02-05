/* eslint-disable react/no-unescaped-entities */
import Anchor from '@theme/components/Anchor';
import Grid from '@theme/components/Grid';
import { DefaultSeo } from '@theme/components/Seo';
import { H1, H3 } from '@theme/components/Typography';
import Link from 'next/link';
import { styled } from 'lib/stitches.config';
import siteConfig from '../config/site';

const Wrapper = styled('div', {
  margin: '0 auto',
  maxWidth: '1430px',
  display: 'flex',
  height: 'calc(100vh)',
  alignItems: 'center',
  color: 'var(--maximeheckel-colors-typeface-primary)',
  gridColumn: 2,
});

const NotFoundPage = () => (
  <Grid columns="medium" gapX={4}>
    <DefaultSeo title={`404: Not found - ${siteConfig.title}`} />
    <Wrapper>
      <div>
        <H1>404 Not Found</H1>
        <H3>
          Oh no! You just got lost 😱! <br />
          Don't worry I got you!{' '}
          <Link href="/" passHref>
            <Anchor underline>Click here</Anchor>
          </Link>{' '}
          to go back home.
        </H3>
      </div>
    </Wrapper>
  </Grid>
);

export default NotFoundPage;
