/* eslint-disable react/no-unescaped-entities */
import { motion } from 'framer-motion';
import { graphql, Link } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import Button from 'gatsby-theme-maximeheckel/src/components/Button';
import Seo from 'gatsby-theme-maximeheckel/src/components/Seo';
import Layout from 'gatsby-theme-maximeheckel/src/layouts/index';
import styled from 'gatsby-theme-maximeheckel/src/utils/styled';
import React from 'react';

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

const WavingHand = () => (
  <motion.div
    style={{
      marginBottom: '-20px',
      marginRight: '-45px',
      paddingBottom: '20px',
      paddingRight: '45px',
      display: 'inline-block',
    }}
    animate={{ rotate: 20 }}
    transition={{
      yoyo: 7,
      from: 0,
      duration: 0.2,
      ease: 'easeInOut',
      type: 'tween',
    }}
  >
    👋
  </motion.div>
);

const IndexPage = ({ data }: Props) => {
  let year = 0;

  return (
    <>
      <Layout
        footer={true}
        header={true}
        headerProps={{ search: true, rss: true }}
      >
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
              <div style={{ marginTop: '100px', paddingBottom: '10px' }}>
                <br />
                <h1 style={{ fontSize: '33px' }}>
                  Hi <WavingHand /> I'm Maxime, and this is my blog.{' '}
                  <span
                    style={{ color: 'var(--maximeheckel-colors-typeface-2)' }}
                  >
                    Here, I share through my writing my experience as a frontend
                    engineer and everything I'm learning about on React,
                    Typescript, SwiftUI, Serverless, and testing.
                  </span>
                </h1>
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
                            to={`/posts/${node.frontmatter.slug}/`}
                          >
                            <FeaturedCard
                              whileHover={{
                                scale: 1.05,
                              }}
                              transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 250,
                              }}
                              background={node.frontmatter.colorFeatured}
                              foreground={node.frontmatter.fontFeatured}
                            >
                              <FeatureCardBody>
                                <h3>{node.frontmatter.title}</h3>

                                <DescriptionBlock>
                                  {node.frontmatter.subtitle}
                                </DescriptionBlock>
                              </FeatureCardBody>
                              <FeatureCardFooter>
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
                                  to={`/posts/${node.frontmatter.slug}/`}
                                >
                                  <Button tab-index={-1} tertiary={true}>
                                    Read
                                  </Button>
                                </Link>
                              </FeatureCardFooter>
                            </FeaturedCard>
                          </Link>
                        </li>
                      );
                    })}
                  </List>
                </section>
                <section style={{ marginTop: '100px' }}>
                  <h2>All articles</h2>
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
                              to={`/posts/${node.frontmatter.slug}/`}
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

const FeaturedCard = styled(motion.div)<{
  background?: string;
  foreground?: string;
}>`
  @media (max-width: 700px) {
    padding: 35px 30px 0px 30px;
  }

  height: 275px;
  background: ${p => p.background};
  border-radius: 10px;
  padding: 40px 40px 0px 40px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 10px 40px;
  margin: 40px auto;

  color: ${p => p.foreground || '#ffffff'};

  div {
    color: ${p => p.foreground || '#ffffff'}!important;
  }

  button {
    color: ${p => p.foreground || '#ffffff'};
    transition: ${p => p.theme.transitionTime}s;
  }

  h3 {
    color: ${p => p.foreground || '#ffffff'}!important;
    font-weight: 600;
  }

  &:hover {
    button {
      color: unset;
    }
  }
`;

const FeatureCardBody = styled('div')`
  @media (max-width: 700px) {
    height: 180px;
  }

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 165px;
`;

const DescriptionBlock = styled('p')`
  max-width: 370px;
  height: 100%;
  max-height: 100px;

  font-size: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  text-wrap: pre-wrap;
`;

const FeatureCardFooter = styled('div')`
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
