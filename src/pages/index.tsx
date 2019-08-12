import { graphql, Link } from 'gatsby';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { MainWrapper, Seo } from 'gatsby-theme-maximeheckel';
import React from 'react';

export const pageQuery = graphql`
  query IndexPageQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          id
          frontmatter {
            slug
            title
            description
            date
          }
        }
      }
    }
  }
`;

const IndexPage = ({ data }) => {
  return (
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
      <Seo title={data.site.siteMetadata.title} />
      <div style={{ paddingBottom: '10px' }}>
        <br />
        <h1>{data.site.siteMetadata.title}</h1>
        <br />
        {data.allMdx.edges.map(({ node }) => {
          return (
            <Link
              key={node.frontmatter.slug}
              style={{ textDecoration: `none` }}
              to={`/posts/${node.frontmatter.slug}`}
            >
              <h2>{node.frontmatter.title}</h2>
            </Link>
          );
        })}
      </div>
    </MainWrapper>
  );
};

export default IndexPage;
