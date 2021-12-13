/* eslint-disable react/no-unescaped-entities */
import { css, styled } from 'lib/stitches.config';
import { format } from 'date-fns';
import { motion, MotionProps } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Anchor from '@theme/components/Anchor';
import Button from '@theme/components/Button';
import Grid from '@theme/components/Grid';
import Card from '@theme/components/Card';
import Flex from '@theme/components/Flex';
import { ExternalIcon, TwitterIcon } from '@theme/components/Icons';
import Text, { H1, H2, H3 } from '@theme/components/Typography';
import VisuallyHidden from '@theme/components/VisuallyHidden';
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
    👋
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
  paddingTop: '128px',
  '> *': {
    gridColumn: 2,
  },
});

const IndexPage = (props: Props) => {
  const { posts } = props;

  return (
    <Layout footer header headerProps={{ search: true }}>
      <Grid
        columns="var(--layout-medium)"
        columnGap={20}
        rowGap={100}
        className={wrapperGrid()}
      >
        <div>
          <H1>
            Hi <WavingHand /> I'm Maxime, and this is my blog.{' '}
            <Text variant="secondary" size="7" weight="4">
              Here, I share through my writing my experience as a frontend
              engineer and everything I'm learning about on React, Typescript,
              SwiftUI, Serverless, and testing.
            </Text>
          </H1>
          <Flex
            css={{
              marginLeft: '-12px',
              marginRight: '-12px',
              gap: '16px',
            }}
          >
            <a
              href="https://maximeheckel.com"
              style={{ textDecoration: 'none' }}
              tabIndex={-1}
            >
              <Button variant="secondary" endIcon={<ExternalIcon />}>
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
              <Button variant="secondary" endIcon={<TwitterIcon />}>
                @MaximeHeckel
              </Button>
              <VisuallyHidden as="p">
                Link redirects to my Twitter profile page
                https://twitter.com/MaximeHeckel.
              </VisuallyHidden>
            </a>
          </Flex>
        </div>
        <section>
          <H2>Newsletter</H2>
          <NewsletterForm large />
        </section>
        <section>
          <H2>Featured</H2>
          <Grid
            as="ul"
            style={{
              marginLeft: '0px',
              marginBottom: '0px',
              padding: '0px',
            }}
            data-testid="featured-list"
            rowGap={16}
          >
            {posts
              .filter((post) => post.featured)
              .map((post) => {
                return (
                  <motion.li
                    style={{
                      position: 'relative',
                      marginLeft: '-8px',
                      marginRight: '-8px',
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
                        <div
                          style={{
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
                            <H2
                              gradient
                              css={{
                                backgroundImage: post.colorFeatured!,
                                marginBottom: '8px',
                              }}
                            >
                              {post.title}
                            </H2>
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
            style={{
              margin: '0',
              padding: '0',
            }}
            data-testid="article-list"
            rowGap={4}
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

const Block = styled('div', {
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
