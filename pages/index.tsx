/* eslint-disable react/no-unescaped-entities */
import {
  styled,
  Anchor,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Icon,
  Text,
  VisuallyHidden,
  H1,
  H2,
  H3,
} from '@maximeheckel/design-system';
import { format } from 'date-fns';
import { motion, MotionProps } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Layout from '@core/layout';
import { getAllFilesFrontMatter } from 'lib/mdx';
import { Post } from 'types/post';
import React from 'react';
import { templateColumnsMedium } from 'styles/grid';

const NewsletterForm = dynamic(() => import('@core/components/NewsletterForm'));

interface Props {
  posts: Post[];
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
      repeat: 7,
      repeatType: 'mirror',
      duration: 0.2,
      delay: 0.5,
      ease: 'easeInOut',
      type: 'tween',
    }}
  >
    👋🏻
  </motion.div>
);

let year = 0;

const cardVariants = {
  hover: {
    scale: 1.05,
  },
  initial: {
    scale: 1,
  },
};

const glowVariants = {
  hover: {
    opacity: 0.8,
  },
  initial: {
    scale: 1.05,
    opacity: 0,
  },
};

const IndexPage = (props: Props) => {
  const { posts } = props;

  return (
    <Layout footer header headerProps={{ offsetHeight: 256 }}>
      <Grid gapX={4} gapY={12} templateColumns={templateColumnsMedium}>
        <Grid.Item col={2}>
          <Flex alignItems="start" direction="column" gap="5">
            <H1>
              Hi <WavingHand /> I'm Maxime, and this is my blog.{' '}
              <Text
                css={{
                  lineHeight: 'unset',
                  letterSpacing: '-0.5px',
                }}
                variant="secondary"
                size="7"
                weight="4"
              >
                Here, I share through my writing my experience as a frontend
                engineer and everything I'm learning about on React, Shaders,
                React Three Fiber, Framer Motion, and more.
              </Text>
            </H1>
            <Flex
              gap={4}
              css={{
                marginLeft: '-var(--space-3)',
                marginRight: '-var(--space-3)',
              }}
            >
              <a
                href="https://maximeheckel.com"
                style={{ textDecoration: 'none' }}
                tabIndex={-1}
              >
                <Button
                  variant="secondary"
                  endIcon={<Icon.External size="4" />}
                >
                  About me
                </Button>
                <VisuallyHidden as="p">
                  Link redirects to my portfolio https://maximeheckel.com.
                </VisuallyHidden>
              </a>
              <a
                href="https://twitter.com/MaximeHeckel"
                style={{ textDecoration: 'none' }}
                tabIndex={-1}
              >
                <Button variant="secondary" endIcon={<Icon.Twitter size="4" />}>
                  @MaximeHeckel
                </Button>
                <VisuallyHidden as="p">
                  Link redirects to my Twitter profile page
                  https://twitter.com/MaximeHeckel.
                </VisuallyHidden>
              </a>
            </Flex>
          </Flex>
        </Grid.Item>
        <Grid.Item as="section" col={2}>
          <Flex alignItems="start" direction="column" gap="5">
            <H2>Newsletter</H2>
            <NewsletterForm large />
          </Flex>
        </Grid.Item>
        <Grid.Item as="section" col={2}>
          <Flex alignItems="start" direction="column" gap="5">
            <H2>Featured</H2>
            <Grid
              as="ul"
              css={{
                margin: 0,
                padding: 0,
              }}
              data-testid="featured-list"
              gapY={4}
            >
              {posts
                .filter((post) => post.featured)
                .map((post) => {
                  return (
                    <motion.li
                      style={{
                        position: 'relative',
                        marginLeft: '-var(--space-1)',
                        marginRight: '-var(--space-1)',
                        listStyle: 'none',
                        cursor: 'pointer',
                        marginBottom: 'calc(1.45rem / 2)',
                        lineHeight: '1.9',
                        letterSpacing: '0.3px',
                      }}
                      key={post.slug}
                      data-testid="featured-article-item"
                      initial="initial"
                      whileHover="hover"
                    >
                      <Link
                        href={`/posts/${post.slug}/`}
                        passHref
                        style={{
                          textDecoration: 'none',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Glow
                          css={{
                            background: post.colorFeatured,
                          }}
                          variants={glowVariants}
                          transition={{
                            type: 'tween',
                            ease: 'easeOut',
                            duration: 0.4,
                          }}
                        />
                        <Flex
                          css={{
                            height: '95%',
                            width: '105%',
                            position: 'absolute',
                            borderRadius: 'var(--border-radius-2)',
                            top: '50%',
                            left: '50%',
                            background: 'var(--background)',
                            transform: 'translateY(-50%) translateX(-50%)',
                            filter: 'blur(20px)',
                            transition: '0.5s',

                            '@media(max-width: 700px)': {
                              display: 'none',
                            },
                          }}
                        />
                        <Card<MotionProps>
                          as={motion.div}
                          variants={cardVariants}
                          transition={{
                            type: 'tween',
                            ease: 'easeOut',
                            duration: 0.4,
                          }}
                          depth={1}
                        >
                          <Card.Body>
                            <H3
                              gradient
                              css={{
                                marginBottom: '8px',
                                backgroundImage: post.colorFeatured!,
                              }}
                            >
                              {post.title}
                            </H3>
                            <Text
                              as="p"
                              css={{ marginBottom: '0px' }}
                              size="2"
                              weight="3"
                              variant="tertiary"
                            >
                              {post.subtitle}
                            </Text>
                          </Card.Body>
                        </Card>
                      </Link>
                    </motion.li>
                  );
                })}
            </Grid>
          </Flex>
        </Grid.Item>
        <Grid.Item col={2} as="section">
          <Flex alignItems="start" direction="column" gap="5">
            <H2>All articles</H2>
            <Grid
              as="ul"
              css={{
                margin: 0,
                padding: 0,
              }}
              data-testid="article-list"
              gapY={1}
            >
              {posts.map((post) => {
                const currentYear = new Date(post.date).getFullYear();
                let printYear;

                if (currentYear !== year) {
                  printYear = true;
                  year = currentYear;
                } else {
                  printYear = false;
                }

                return (
                  <Box
                    as="li"
                    css={{
                      listStyle: 'none',
                      cursor: 'pointer',
                      lineHeight: '1.9',
                      letterSpacing: '0.3px',
                    }}
                    key={post.slug}
                    data-testid="article-item"
                  >
                    {printYear ? (
                      <Text
                        as="p"
                        weight="4"
                        css={{
                          padding: 'var(--space-6) 0px',
                        }}
                      >
                        {currentYear}
                      </Text>
                    ) : null}
                    {/* Revisit this component: merge Anchor and block together (extend block from Anchor) */}
                    <Link
                      href={`/posts/${post.slug}/`}
                      passHref
                      style={{ textDecoration: 'none', fontWeight: 500 }}
                    >
                      <Block data-testid="article-link">
                        <Text
                          as="p"
                          size="1"
                          variant="tertiary"
                          weight="3"
                          css={{
                            minWidth: '52px',
                            marginRight: '32px',
                            marginTop: '2px',
                          }}
                        >
                          {format(new Date(Date.parse(post.date)), 'MMM dd')}
                        </Text>
                        <Text weight="3">{post.title}</Text>
                      </Block>
                    </Link>
                  </Box>
                );
              })}
            </Grid>
            <Card css={{ marginBottom: 'var(--space-9)', width: '100%' }}>
              <Card.Body
                alignItems="start"
                as={Flex}
                direction="column"
                gap="5"
              >
                <H3>#BlackLivesMatter</H3>
                <Anchor underline href="https://blacklivesmatters.carrd.co/">
                  Click here to find out how you can help.
                </Anchor>
              </Card.Body>
            </Card>
          </Flex>
        </Grid.Item>
      </Grid>
    </Layout>
  );
};

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter();

  return { props: { posts } };
}

const Glow = styled(motion.div, {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  webkitFilter: 'blur(15px)',
  filter: 'blur(15px)',
  borderRadius: 'var(--border-radius-2)',
});

const Block = styled(Box, {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'start',
  width: '100%',
  borderRadius: 'var(--border-radius-2)',
  marginLeft: '-8px',
  padding: '16px 8px',
  boxShadow: 'none',
  backgroundColor: 'var(--article-block-background-color, "transparent")',
  color: 'var(--article-block-color, var(--text-primary))',
  transition: 'background-color 0.25s, box-shadow 0.25s, color 0.25s',

  '&:focus': {
    '--article-block-background-color': 'var(--emphasis)',
    '--article-block-color': 'var(--accent)',
  },

  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      '--article-block-background-color': 'var(--emphasis)',
      '--article-block-color': 'var(--accent)',
    },
  },
});

export default IndexPage;
