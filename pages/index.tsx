/* eslint-disable react/no-unescaped-entities */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
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

const IndexPage = (props: Props) => {
  const { posts } = props;

  return (
    <Layout footer header headerProps={{ search: true }}>
      <Grid
        columns="var(--layout-medium)"
        columnGap={20}
        rowGap={100}
        css={css`
          padding-top: 128px;
          > * {
            grid-column: 2;
          }
        `}
      >
        <div>
          <h1>
            Hi <WavingHand /> I'm Maxime, and this is my blog.{' '}
            <span
              css={css`
                color: var(--maximeheckel-colors-typeface-secondary);
              `}
            >
              Here, I share through my writing my experience as a frontend
              engineer and everything I'm learning about on React, Typescript,
              SwiftUI, Serverless, and testing.
            </span>
          </h1>
          <Flex
            gap={8}
            css={css`
              margin-left: -12px;
              margin-right: -12px;
            `}
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
          <h2>Newsletter</h2>
          <NewsletterForm large />
        </section>
        <section>
          <h2>Featured</h2>
          <List as="ul" data-testid="featured-list" rowGap={16}>
            {posts
              .filter((post) => post.featured)
              .map((post) => {
                return (
                  <motion.li
                    css={css`
                      position: relative;
                      margin-left: -8px;
                      margin-right: -8px;
                    `}
                    key={post.slug}
                    data-testid="featured-article-item"
                    initial="initial"
                    whileHover="hover"
                  >
                    <Link href={`/posts/${post.slug}/`}>
                      <a
                        css={css`
                          text-decoration: none;
                          color: var(--maximeheckel-colors-typeface-secondary);
                        `}
                      >
                        <Glow
                          css={css`
                            background: ${post.colorFeatured};
                          `}
                          variants={glowVariants}
                          transition={{
                            type: 'tween',
                            ease: 'easeOut',
                            // delay: 0.15,
                            duration: 0.4,
                          }}
                        />
                        <div
                          css={css`
                            height: 95%;
                            width: 105%;
                            position: absolute;
                            border-radius: var(--border-radius-2);
                            top: 50%;
                            left: 50%;
                            background: var(--maximeheckel-colors-body);
                            transform: translateY(-50%) translateX(-50%);
                            filter: blur(20px);
                            transition: 0.5s;
                          `}
                        />
                        <Card<MotionProps>
                          as={motion.div}
                          variants={cardVariants}
                          transition={{
                            type: 'tween',
                            ease: 'easeOut',
                            // delay: 0.15,
                            duration: 0.4,
                          }}
                          depth={1}
                        >
                          <Card.Body>
                            <TitleWithBackground
                              background={post.colorFeatured!}
                            >
                              {post.title}
                            </TitleWithBackground>
                            <p
                              css={css`
                                margin-top: 1em;
                              `}
                            >
                              {post.subtitle}
                            </p>
                          </Card.Body>
                        </Card>
                      </a>
                    </Link>
                  </motion.li>
                );
              })}
          </List>
        </section>
        <section>
          <h2>All articles</h2>
          <List as="ul" data-testid="article-list" rowGap={4}>
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
                <li key={post.slug} data-testid="article-item">
                  {printYear ? <YearBlock>{currentYear}</YearBlock> : null}
                  <Link href={`/posts/${post.slug}/`} passHref>
                    {/* Revisit this component: merge Anchor and block together (extend block from Anchor) */}
                    <a style={{ textDecoration: 'none' }}>
                      <Block data-testid="article-link">
                        <DateBlock>
                          {format(new Date(Date.parse(post.date)), 'MMM dd')}
                        </DateBlock>
                        {post.title}
                      </Block>
                    </a>
                  </Link>
                </li>
              );
            })}
          </List>
          <br />
          <Card>
            <Card.Body>
              <h3>#BlackLivesMatter</h3>
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

const Glow = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-filter: blur(15px);
  filter: blur(15px);
  border-radius: var(--border-radius-2);
`;

const TitleWithBackground = styled('h2')<{ background: string }>`
  color: var(--maximeheckel-colors-typeface-primary);
  margin-bottom: 0px !important;
  letter-spacing: -0.02em;
  margin-block-end: 0px;
  background: ${(p) => p.background};
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
  padding-left: 10px;
  border-radius: var(--border-radius-2);
  margin-left: -10px;

  height: 60px;
  box-shadow: none;

  color: var(--maximeheckel-colors-typeface-primary);
  transition: background-color 0.25s, box-shadow 0.25s, color 0.25s;

  &:focus {
    background-color: var(--maximeheckel-colors-emphasis);
    color: var(--maximeheckel-colors-brand);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: var(--maximeheckel-colors-emphasis);
      // box-shadow: var(--maximeheckel-shadow-1);
      color: var(--maximeheckel-colors-brand);
    }
  }
`;

const YearBlock = styled('div')`
  padding: 30px 0px;
  font-weight: 600;
`;

const DateBlock = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: var(--maximeheckel-colors-typeface-tertiary);
  min-width: 50px;
  margin-right: 32px;
`;

const List = styled(Grid)`
  margin-left: 0px;
  margin-bottom: 0px;

  li {
    list-style: none;
    cursor: pointer;
  }

  h3 {
    color: var(--maximeheckel-colors-typeface-primary);
  }
`;

export default IndexPage;
