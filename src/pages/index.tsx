/* eslint-disable react/no-unescaped-entities */
import { motion } from 'framer-motion';
import { graphql, Link } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import Button from 'gatsby-theme-maximeheckel/src/components/Button';
import Seo from 'gatsby-theme-maximeheckel/src/components/Seo';
import Layout from 'gatsby-theme-maximeheckel/src/layouts/index';
import styled from 'gatsby-theme-maximeheckel/src/utils/styled';
import React from 'react';
import SearchBox from 'gatsby-theme-maximeheckel/src/components/SearchBox';

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
            subtitle
            date
            featured
            type
            colorFeatured
            fontFeatured
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

interface Props {
  data: {
    allMdx: {
      edges: Array<{
        node: {
          id: string;
          frontmatter: {
            slug: string;
            title: string;
            subtitle: string;
            date: string;
            tags: string[];
            type: 'snippet' | 'blogPost';
            featured?: boolean;
            colorFeatured?: string;
            fontFeatured?: string;
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
  };
  location: {
    search?: string;
  };
}

const IndexPage = ({ data, location }: Props) => {
  const [showSearch, setShowSearch] = React.useState(location.search !== '');
  let year = 0;

  return (
    <>
      <Layout footer={true} header={true}>
        {(layoutProps: {
          site: {
            siteMetadata: {
              author: string;
              title: string;
              url: string;
            };
          };
        }) => {
          const { site } = layoutProps;
          return (
            <>
              <Seo title={site.siteMetadata.title} />
              <SearchBox
                location={location}
                showOverride={showSearch}
                onClose={() => setShowSearch(false)}
              />
              <div style={{ marginTop: '100px', paddingBottom: '10px' }}>
                <br />
                <h1>Hi 👋 I'm Maxime, and this is my blog.</h1>
                <h3 style={{ fontWeight: 400 }}>
                  I share my frontend engineering experience, and my expertise
                  with technical articles about React, Typescript, Jamstack,
                  Serverless, and testing.
                </h3>
                <section style={{ marginTop: '100px' }}>
                  <h2>Featured</h2>
                  <List data-testid="featured-list">
                    {data.allMdx.edges.map(({ node }) => {
                      if (!node.frontmatter.featured) {
                        return null;
                      }

                      return (
                        <li key={node.frontmatter.slug}>
                          <Link
                            style={{ textDecoration: `none` }}
                            to={`/posts/${node.frontmatter.slug}?featured=true`}
                          >
                            <BigBlock
                              whileHover={{
                                scale: 1.05,
                                marginBottom: '60px',
                                marginTop: '60px',
                              }}
                              transition={{ type: 'spring', damping: 20 }}
                              background={node.frontmatter.colorFeatured}
                              color={node.frontmatter.fontFeatured}
                            >
                              <h3>{node.frontmatter.title}</h3>

                              <DescriptionBlock>
                                <p>{node.frontmatter.subtitle}</p>
                                <hr />
                              </DescriptionBlock>
                              <ItemFooterBlock>
                                <DateBlock>
                                  {`${
                                    MONTHS[
                                      new Date(node.frontmatter.date).getMonth()
                                    ]
                                  } ${new Date(
                                    node.frontmatter.date
                                  ).getDate()} ${new Date(
                                    node.frontmatter.date
                                  ).getFullYear()}`}
                                </DateBlock>
                                <div />
                                <Link
                                  style={{ textDecoration: `none` }}
                                  to={`/posts/${node.frontmatter.slug}?featured=true`}
                                >
                                  <Button tabIndex={-1} tertiary={true}>
                                    Read
                                  </Button>
                                </Link>
                              </ItemFooterBlock>
                            </BigBlock>
                          </Link>
                        </li>
                      );
                    })}
                  </List>
                </section>
                <section style={{ marginTop: '100px' }}>
                  <h2>All articles</h2>
                  <ShortcutList>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowSearch(true)}
                    >
                      Click or<ShortcutIcon>⌘/CTRL</ShortcutIcon> +{' '}
                      <ShortcutIcon>K</ShortcutIcon> to search
                    </div>
                  </ShortcutList>
                  <List data-testid="article-list">
                    {data.allMdx.edges
                      .filter(({ node }) => node.frontmatter.type !== 'snippet')
                      .map(({ node }) => {
                        let currentYear = new Date(
                          node.frontmatter.date
                        ).getFullYear();
                        let printYear;

                        if (currentYear !== year) {
                          printYear = true;
                          year = currentYear;
                        } else {
                          printYear = false;
                        }

                        return (
                          <li
                            style={{ marginLeft: '-10px' }}
                            key={node.frontmatter.slug}
                            data-testid="article-item"
                          >
                            {printYear ? (
                              <YearBlock>{currentYear}</YearBlock>
                            ) : null}
                            <Link
                              style={{ textDecoration: `none` }}
                              to={`/posts/${node.frontmatter.slug}`}
                            >
                              <Block data-testid="article-link">
                                <DateBlock>
                                  {`${
                                    MONTHS[
                                      new Date(node.frontmatter.date).getMonth()
                                    ]
                                  } ${new Date(
                                    node.frontmatter.date
                                  ).getDate()}`}
                                </DateBlock>
                                <TitleBlock>
                                  {node.frontmatter.title}
                                </TitleBlock>
                              </Block>
                            </Link>
                          </li>
                        );
                      })}
                  </List>
                </section>
                <BigBlock background="black">
                  <h3>#BlackLivesMatter</h3>

                  <DescriptionBlock>
                    <a
                      style={{ color: 'white' }}
                      href="https://blacklivesmatters.carrd.co/"
                    >
                      Go here to find out how you can help.
                    </a>
                  </DescriptionBlock>
                </BigBlock>
              </div>
            </>
          );
        }}
      </Layout>
    </>
  );
};

const ShortcutList = styled('div')`
  display: flex;
  width: 100%;
  margin-top: 8px;
  margin-bottom: 30px;
  div {
    display: flex;
    color: ${p => p.theme.colors.gray};
    cursor: pointer;
  }
`;

const ShortcutIcon = styled('div')`
  border: 2px solid ${p => p.theme.colors.gray};
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
    font-size: 16px;
    margin-bottom: 20px;
  }

  hr {
    margin-bottom: 10px;
    width: 150px;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ItemFooterBlock = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
`;

const BigBlock = styled(motion.div)<{ color?: string; background?: string }>`
  @media (max-width: 700px) {
    min-height: 150px;
    height: unset;
    padding: 40px 30px;

    p,
    hr {
      display: none;
    }
  }

  &:hover {
    button {
      color: unset;
    }
  }

  position: relative;
  width: 100%;
  min-height: 300px;
  height: 300px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 20px 40px;
  padding: 80px 60px;
  background: ${p => p.background};
  border-radius: 10px;
  margin: 30px auto;
  overflow: hidden;
  color: ${p => p.color || '#ffffff'};

  div {
    color: ${p => p.color || '#ffffff'}!important;
  }

  button {
    color: ${p => p.color || '#ffffff'};
    transition: ${p => p.theme.transitionTime}s;
  }

  h3 {
    color: ${p => p.color || '#ffffff'}!important;
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
  border-radius: 6px;

  height: 60px;
  box-shadow: none;

  color: ${p => p.theme.fontColor};
  transition ${p => p.theme.transitionTime / 4}s;

  div:first-of-type {
    margin-right: 40px;
  }

  &:hover {
    background-color: ${p => p.theme.foregroundColor};
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
  color: ${p => p.theme.colors.gray};
  min-width: 50px;
`;

const TitleBlock = styled('div')`
  font-weight: 500;
  transition ${p => p.theme.transitionTime / 2}s;
`;

const List = styled('ul')`
  margin-left: 0px;

  li {
    list-style: none;
  }

  h3 {
    color: ${p => p.theme.fontColor};
    margin-bottom: 10px;
  }
`;

export default IndexPage;
