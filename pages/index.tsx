/* eslint-disable react/no-unescaped-entities */
import {
  css,
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
import Layout from '@theme/layout';
import { getAllFilesFrontMatter } from 'lib/mdx';
import { Post, PostType } from 'types/post';

const NewsletterForm = dynamic(
  () => import('@theme/components/NewsletterForm')
);

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

const wrapperGrid = css({
  '> *': {
    gridColumn: 2,
  },
});

const IndexPage = (props: Props) => {
  const { posts } = props;

  return (
    <Layout footer header headerProps={{ offsetHeight: 256 }}>
      <Grid columns="medium" gapX={4} gapY={12} className={wrapperGrid()}>
        <Box>
          <H1>
            Hi <WavingHand /> I'm Maxime, and this is my blog.{' '}
            <Text variant="secondary" size="7" weight="4">
              Here, I share through my writing my experience as a frontend
              engineer and everything I'm learning about on React, Typescript,
              SwiftUI, Serverless, and testing.
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
              <Button variant="secondary" endIcon={<Icon.External />}>
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
              <Button variant="secondary" endIcon={<Icon.Twitter />}>
                @MaximeHeckel
              </Button>
              <VisuallyHidden as="p">
                Link redirects to my Twitter profile page
                https://twitter.com/MaximeHeckel.
              </VisuallyHidden>
            </a>
          </Flex>
        </Box>
        <section>
          <H2>Newsletter</H2>
          <NewsletterForm large />
        </section>
        <section>
          <H2>Featured</H2>
          <Grid
            as="ul"
            css={{
              marginLeft: '0px',
              marginBottom: '0px',
              padding: '0px',
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
                    <Link href={`/posts/${post.slug}/`}>
                      <a
                        style={{
                          textDecoration: 'none',
                          color:
                            'var(--maximeheckel-colors-typeface-secondary)',
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
                        <Box
                          css={{
                            height: '95%',
                            width: '105%',
                            position: 'absolute',
                            borderRadius: 'var(--border-radius-2)',
                            top: '50%',
                            left: '50%',
                            background: 'var(--maximeheckel-colors-body)',
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
                            <Text as="p" css={{ marginBottom: '0px' }}>
                              {post.subtitle}
                            </Text>
                          </Card.Body>
                        </Card>
                      </a>
                    </Link>
                  </motion.li>
                );
              })}
          </Grid>
        </section>
        <section>
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
                <li
                  style={{
                    listStyle: 'none',
                    cursor: 'pointer',
                    marginBottom: 'calc(1.45rem / 2)',
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
                        paddingTop: '30px',
                      }}
                    >
                      {currentYear}
                    </Text>
                  ) : null}
                  <Link href={`/posts/${post.slug}/`} passHref>
                    {/* Revisit this component: merge Anchor and block together (extend block from Anchor) */}
                    <a style={{ textDecoration: 'none', fontWeight: 500 }}>
                      <Block data-testid="article-link">
                        <Text
                          as="p"
                          size="1"
                          variant="tertiary"
                          weight="3"
                          css={{
                            minWidth: '52px',
                            marginRight: '32px',
                            marginBottom: '0px',
                          }}
                        >
                          {format(new Date(Date.parse(post.date)), 'MMM dd')}
                        </Text>
                        {post.title}
                      </Block>
                    </a>
                  </Link>
                </li>
              );
            })}
          </Grid>
          <br />
          <Card>
            <Card.Body>
              <H3>#BlackLivesMatter</H3>
              <Anchor underline href="https://blacklivesmatters.carrd.co/">
                Click here to find out how you can help.
              </Anchor>
            </Card.Body>
          </Card>
        </section>
      </Grid>
    </Layout>
  );
};

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter(PostType.BLOGPOST);

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
  alignItems: 'center',
  paddingLeft: '10px',
  borderRadius: 'var(--border-radius-2)',
  marginLeft: '-10px',
  height: '60px',
  boxShadow: 'none',
  backgroundColor: 'var(--article-block-background-color, "transparent")',
  color:
    'var(--article-block-color, var(--maximeheckel-colors-typeface-primary))',
  transition: 'background-color 0.25s, box-shadow 0.25s, color 0.25s',

  '&:focus': {
    '--article-block-background-color': 'var(--maximeheckel-colors-emphasis)',
    '--article-block-color': 'var(--maximeheckel-colors-brand)',
  },

  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      '--article-block-background-color': 'var(--maximeheckel-colors-emphasis)',
      '--article-block-color': 'var(--maximeheckel-colors-brand)',
    },
  },

  '@media (max-width: 700px)': {
    height: '100px',
  },
});

export default IndexPage;
