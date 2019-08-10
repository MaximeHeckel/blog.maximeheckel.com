import styled from '@emotion/styled';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { MainWrapper, Seo } from 'gatsby-theme-maximeheckel';
import React from 'react';

const ComingSoonBlock = styled('div')`
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: row;
  align-items: center;
  transition: ${props => props.theme.transitionTime}s;
`;

const IndexPage = () => (
  <MainWrapper
    footer={true}
    header={true}
    headerProps={{
      links: (
        <React.Fragment>
          <OutboundLink
            data-testid="home-link"
            href="https://maximeheckel.com"
            style={{ textDecoration: 'underline' }}
          >
            Home
          </OutboundLink>
          <OutboundLink
            data-testid="twitter-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://twitter.com/MaximeHeckel"
            style={{ textDecoration: 'underline' }}
          >
            Twitter
          </OutboundLink>
        </React.Fragment>
      ),
    }}
  >
    <Seo title="Maxime Heckel's Blog" />
    <ComingSoonBlock>
      <h1>Words by Maxime Heckel. Coming Soon.</h1>
    </ComingSoonBlock>
  </MainWrapper>
);

export default IndexPage;
