import styled from '@emotion/styled';
import { graphql, Link } from 'gatsby';
import { Button, MainWrapper, Seo } from 'gatsby-theme-maximeheckel';
import React from 'react';
import Typist from 'react-typist';
import SearchBox from '../components/SearchBox';
import TypistLoop from '../components/TypistLoop';

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
          timeToRead
          frontmatter {
            slug
            title
            description
            date
            cover {
              childImageSharp {
                fluid(
                  maxWidth: 1050
                  maxHeight: 900
                  quality: 70
                  cropFocus: ENTROPY
                ) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ShortcutList = styled('div')`
  display: flex;
  width: 100%;
  margin-left: -6px;
  margin-top: 8px;
  margin-bottom: 30px;
  div {
    display: flex;
    color: #73737d;
  }
`;

const ShortcutIcon = styled('div')`
  border: 2px solid #73737D;
  border-radius: 5px;
  min-width: 30px;
  padding-left: 5px;
  padding-right: 5px;
  margin-right: 6px;
  margin-left: 6px;
  justify-content: center;
  font-size: 12px;
}
`;

const IndexPage = ({ data, location }) => {
  return (
    <MainWrapper footer={true} header={true}>
      <Seo title={data.site.siteMetadata.title} />
      <SearchBox location={location} />
      <div style={{ paddingBottom: '10px' }}>
        <br />
        <h1>{data.site.siteMetadata.title}</h1>
        <TypistDiv>
          <h2>I write about </h2>
          <h2>
            <TypistLoop interval={2000}>
              {[
                'React',
                'Redux',
                'GraphQL',
                'testing',
                'Docker',
                'frontend development',
                'styled components',
                'a lot of other things',
              ].map(text => (
                <Typist
                  cursor={{ blink: true, element: '_' }}
                  key={text}
                  startDelay={2000}
                >
                  <span>{text}</span>
                </Typist>
              ))}
            </TypistLoop>
          </h2>
        </TypistDiv>
        <hr />
        <ShortcutList>
          <div>
            <ShortcutIcon>⌘/CTRL</ShortcutIcon> + <ShortcutIcon>K</ShortcutIcon>{' '}
            to search
          </div>
        </ShortcutList>
        <List>
          {data.allMdx.edges.map(({ node }) => {
            return (
              <li key={node.frontmatter.slug}>
                <Link
                  style={{ textDecoration: `none` }}
                  to={`/posts/${node.frontmatter.slug}`}
                >
                  <h3>{node.frontmatter.title}</h3>
                </Link>
                <DescriptionBlock>
                  {node.frontmatter.description}
                </DescriptionBlock>
                <ItemFooterBlock>
                  <p>
                    {new Date(Date.parse(node.frontmatter.date)).toDateString()}
                  </p>
                  <p>{node.timeToRead} min read</p>
                  <Link
                    style={{ textDecoration: `none` }}
                    to={`/posts/${node.frontmatter.slug}`}
                  >
                    <Button secondary={true}>Read</Button>
                  </Link>
                </ItemFooterBlock>
              </li>
            );
          })}
        </List>
      </div>
    </MainWrapper>
  );
};

const TypistDiv = styled('div')`
  display: flex;
  h2 {
    margin-right: 8px;
  }
`;

const List = styled('ul')`
  margin-left: 0px;

  li {
    list-style: none;
    margin-bottom: 30px;
  }

  h3 {
    margin-bottom: 10px;
  }
`;

const DescriptionBlock = styled('p')`
  color: #73737d;
  margin-bottom: 8px;
  max-width: 350px;
`;

const ItemFooterBlock = styled('div')`
  display: flex;
  align-items: center;

  p {
    font-size: 14px;
    font-weight: 600;
    margin-right: 8px;
    margin-bottom: 0px;
  }
`;

export default IndexPage;
