/* eslint-disable react/no-unescaped-entities */
import { css } from '@emotion/core';
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

  const cardVariants = {
    hover: {
      scale: 1.05,
    },
    initial: {
      scale: 1,
    },
  };

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
              <Seo
                title={site.siteMetadata.title}
                banner="/main-og-image.png"
              />
              <div
                css={css`
                  margin-top: 100px;
                  padding-bottom: 10px;
                `}
              >
                <br />
                <h1
                  css={css`
                    font-size: 33px;
                  `}
                >
                  Hi <WavingHand /> I'm Maxime, and this is my blog.{' '}
                  <span
                    css={css`
                      color: var(--maximeheckel-colors-typeface-2);
                    `}
                  >
                    Here, I share through my writing my experience as a frontend
                    engineer and everything I'm learning about on React,
                    Typescript, SwiftUI, Serverless, and testing.
                  </span>
                </h1>
                <section
                  css={css`
                    margin-top: 100px;
                  `}
                >
                  <h2>Featured</h2>
                  <List
                    data-testid="featured-list"
                    css={css`
                      padding-top: 30px;
                      display: grid;
                      grid-gap: 15px;
                    `}
                  >
                    {data.allMdx.edges
                      .filter(({ node }) => node.frontmatter.featured)
                      .map(({ node }) => {
                        return (
                          <li
                            key={node.frontmatter.slug}
                            data-testid="featured-article-item"
                          >
                            <Link
                              style={{ textDecoration: `none` }}
                              to={`/posts/${node.frontmatter.slug}/`}
                            >
                              <Card
                                variants={cardVariants}
                                initial="initial"
                                whileHover="hover"
                                transition={{
                                  ease: 'easeOut',
                                  delay: 0.1,
                                  duration: 0.4,
                                }}
                              >
                                <TitleWithBackground
                                  background={node.frontmatter.colorFeatured!}
                                >
                                  {node.frontmatter.title}
                                </TitleWithBackground>
                                <p>{node.frontmatter.subtitle}</p>
                              </Card>
                            </Link>
                          </li>
                        );
                      })}
                  </List>
                </section>
                <section
                  css={css`
                    margin-top: 100px;
                  `}
                >
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
                <Card>
                  <h3>#BlackLivesMatter</h3>
                  <a href="https://blacklivesmatters.carrd.co/">
                    Click here to find out how you can help.
                  </a>
                </Card>
              </div>
            </>
          );
        }}
      </Layout>
    </>
  );
};

const Card = styled(motion.div)`
  border-radius: var(--border-radius-2);
  margin-bottom: 0px;
  overflow: hidden;
  position: relative;
  background: var(--maximeheckel-colors-foreground);
  box-shadow: var(--maximeheckel-shadow-1);

  padding: 36px 24px;

  p {
    color: var(--maximeheckel-colors-typeface-1);
    margin-top: 1em;
  }
`;

const TitleWithBackground = styled('h2')<{ background: string }>`
  color: var(--maximeheckel-colors-typeface-0);
  margin-bottom: 0px !important;
  letter-spacing: -0.02em;
  margin-block-end: 0px;
  background: ${p => p.background};
  background-clip: text;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
`;

const Block = styled('div')`
  @media (max-width: 700px) {
    height: 100px;
  }

  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 15px;
  border-radius: var(--border-radius-2);
  margin-left: -10px;

  height: 60px;
  box-shadow: none;

  color: var(--maximeheckel-colors-typeface-0);
  transition: background-color 0.25s, box-shadow 0.25s, color 0.25s;

  div:first-of-type {
    margin-right: 40px;
  }

  &:hover {
    background-color: var(--maximeheckel-colors-foreground);
    box-shadow: var(--maximeheckel-shadow-1);
    color: var(--maximeheckel-colors-brand);
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
  color: var(--maximeheckel-colors-typeface-2);
  min-width: 50px;
`;

const TitleBlock = styled('div')`
  font-weight: 500;
`;

const List = styled('ul')`
  margin-left: 0px;

  li {
    list-style: none;
  }

  h3 {
    color: var(--maximeheckel-colors-typeface-0);
    margin-bottom: 10px;
  }
`;

export default IndexPage;
