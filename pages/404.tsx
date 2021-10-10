/* eslint-disable react/no-unescaped-entities */
import { styled } from 'lib/stitches.config';
import Link from 'next/link';
import Anchor from '@theme/components/Anchor';
import Grid from '@theme/components/Grid';
import { DefaultSeo } from '@theme/components/Seo';
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
  <Grid columns="1px 1fr 1px" gap={20}>
    <DefaultSeo title={`404: Not found - ${siteConfig.title}`} />
    <Wrapper>
      <div>
        <h1>404 Not Found</h1>

        <h3>
          Oh no! You just got lost 😱! <br />
          Don't worry I got you!{' '}
          <Link href="/" passHref>
            <Anchor underline>Click here</Anchor>
          </Link>{' '}
          to go back home.
        </h3>
      </div>
    </Wrapper>
  </Grid>
);

export default NotFoundPage;
