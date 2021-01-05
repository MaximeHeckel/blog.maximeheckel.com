/* eslint-disable react/no-unescaped-entities */
import styled from '@emotion/styled';
import Link from 'next/link';
import React from 'react';
import { DefaultSeo } from '@theme/components/Seo';
import Layout from '@theme/layouts';
import siteConfig from '../config/site';

const NotFoundPage = () => (
  <Layout>
    <DefaultSeo title={`404: Not found - ${siteConfig.title}`} />
    <Wrapper>
      <div>
        <h1>404 Not Found</h1>

        <h3>
          Oh no! You just got lost 😱! <br />
          Don't worry I got you!{' '}
          <Link href="/">
            <a>Click here</a>
          </Link>{' '}
          to go back home.
        </h3>
      </div>
    </Wrapper>
  </Layout>
);

export default NotFoundPage;

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1430px;
  display: flex;
  height: calc(100vh);
  align-items: center;
  color: var(--maximeheckel-colors-typeface-0);
  padding: 0px 70px;

  @media (max-width: 700px) {
    padding: 0px 30px;
  }
`;
