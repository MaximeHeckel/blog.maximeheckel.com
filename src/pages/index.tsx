/* eslint-disable react/no-unescaped-entities */
import { graphql, Link } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import Button from 'gatsby-theme-maximeheckel/src/components/Button';
import Seo from 'gatsby-theme-maximeheckel/src/components/Seo';
import MainWrapper from 'gatsby-theme-maximeheckel/src/layouts/MainWrapper';
import styled from 'gatsby-theme-maximeheckel/src/utils/styled';
import React from 'react';
import SearchBox from '../components/SearchBox';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

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
            featured
            colorFeatured
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

interface IProps {
  data: {
    allMdx: {
      edges: Array<{
        node: {
          id: string;
          frontmatter: {
            slug: string;
            title: string;
            description: string;
            date: string;
            subtitle: string;
            tags: string[];
            featured?: boolean;
            colorFeatured?: string;
            cover: {
              childImageSharp: {
                fluid: FluidObject;
              };
            };
          };
          timeToRead: number;
        };
      }>;
    };
    site: {
      siteMetadata: {
        title: string;
        posts: Array<{
          title: string;
          url: string;
          date: string;
        }>;
      };
    };
  };
  location: {
    search?: string;
  };
}

const IndexPage = ({ data, location }: IProps) => {
  const [showSearch, setShowSearch] = React.useState(location.search !== '');
  let year = 0;

  return (
    <MainWrapper footer={true} header={true}>
      <Seo title={data.site.siteMetadata.title} />
      <SearchBox
        location={location}
        showOverride={showSearch}
        onClose={() => setShowSearch(false)}
      />
      <div style={{ paddingTop: '10px', paddingBottom: '10px' }}>
        <br />
        <h2>Hi 👋 I'm Maxime, and this is my blog.</h2>
        <p>
          I share my frontend engineering experience, with technical articles
          about React, Typescript, Serverless and testing.
        </p>
        <hr />
        <ShortcutList>
          <div role="button" tabIndex={0} onClick={() => setShowSearch(true)}>
            Click or<ShortcutIcon>⌘/CTRL</ShortcutIcon> +{' '}
            <ShortcutIcon>K</ShortcutIcon> to search
          </div>
        </ShortcutList>
        <h3 style={{ fontWeight: 600 }}>Featured</h3>
        <List data-testid="featured-list">
          {data.allMdx.edges.map(({ node }) => {
            if (!node.frontmatter.featured) {
              return null;
            }

            return (
              <BigBlock
                key={node.frontmatter.slug}
                color={node.frontmatter.colorFeatured}
              >
                <h3>{node.frontmatter.title}</h3>

                <DescriptionBlock>
                  <p>{node.frontmatter.description}</p>
                  <hr />
                </DescriptionBlock>
                <ItemFooterBlock>
                  <DateBlock>
                    {`${
                      MONTHS[new Date(node.frontmatter.date).getMonth()]
                    } ${new Date(node.frontmatter.date).getDate()} ${new Date(
                      node.frontmatter.date
                    ).getFullYear()}`}
                  </DateBlock>
                  <Link
                    style={{ textDecoration: `none` }}
                    to={`/posts/${node.frontmatter.slug}?featured=true`}
                  >
                    <Button secondary={true}>Read</Button>
                  </Link>
                </ItemFooterBlock>
              </BigBlock>
            );
          })}
        </List>
        <hr />
        <h3 style={{ fontWeight: 600 }}>All articles</h3>
        <List data-testid="article-list">
          {data.allMdx.edges.map(({ node }) => {
            let currentYear = new Date(node.frontmatter.date).getFullYear();
            let printYear;

            if (currentYear !== year) {
              printYear = true;
              year = currentYear;
            } else {
              printYear = false;
            }

            return (
              <li key={node.frontmatter.slug} data-testid="article-item">
                {printYear ? <YearBlock>{currentYear}</YearBlock> : null}
                <Link
                  style={{ textDecoration: `none` }}
                  to={`/posts/${node.frontmatter.slug}`}
                >
                  <Block data-testid="article-link">
                    <DateBlock>
                      {`${
                        MONTHS[new Date(node.frontmatter.date).getMonth()]
                      } ${new Date(node.frontmatter.date).getDate()}`}
                    </DateBlock>
                    <TitleBlock>{node.frontmatter.title}</TitleBlock>
                  </Block>
                </Link>
              </li>
            );
          })}
        </List>
      </div>
    </MainWrapper>
  );
};

const ShortcutList = styled('div')`
  display: flex;
  width: 100%;
  margin-top: 8px;
  margin-bottom: 30px;
  div {
    display: flex;
    color: #8a8a90;
    cursor: pointer;
  }
`;

const ShortcutIcon = styled('div')`
  border: 2px solid #8a8a90;
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

const DescriptionBlock = styled('div')`
  width: 370px;

  p {
    mix-blend-mode: exclusion;
    color: #8a8a90;
    font-size: 16px;
    margin-bottom: 20px;
  }

  hr {
    margin-bottom: 10px;
    width: 150px;
    mix-blend-mode: exclusion;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ItemFooterBlock = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
`;

const BigBlock = styled('li')`
  @media (max-width: 600px) {
    min-height: 150px;
    height: unset;
    padding: 30px 30px;

    p {
      display: none;
    }
  }

  position: relative;
  width: 100%;
  min-height: 300px;
  height: 300px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 20px 40px;
  padding: 80px 70px;
  background-color: ${p => p.color};
  border-radius: 5px;
  margin: 30px auto;
  overflow: hidden;
  transition: ${p => p.theme.transitionTime}s;
  will-change: opacity;

  h3 {
    mix-blend-mode: exclusion;
    color: #ffffff !important;
    font-weight: 600;
  }
`;

const Block = styled('div')`
  @media (max-width: 700px) {
    height: 100px;
  }

  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 15px;
  border-radius: 2px;

  height: 60px;
  box-shadow: none;

  color: ${p => p.theme.fontColor};
  transition ${p => p.theme.transitionTime / 4}s;

  div:first-of-type {
    margin-right: 40px;
  }

  &:hover {
    background-color: ${p => p.theme.overlayBackground};
    box-shadow: ${p => p.theme.boxShadow};
    color: ${p => p.theme.colors.blue};
  }
`;

const YearBlock = styled('div')`
  padding: 30px 15px;
  font-weight: 600;
  font-size: 18px;
`;

const DateBlock = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #8a8a90;
  min-width: 50px;
`;

const TitleBlock = styled('div')`
  font-weight: 500;
  transition ${p => p.theme.transitionTime / 2}s;
`;

const List = styled('ul')`
  margin-left: -10px;

  li {
    list-style: none;
  }

  h3 {
    color: ${p => p.theme.fontColor};
    margin-bottom: 10px;
  }
`;

export default IndexPage;
