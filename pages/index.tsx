/* eslint-disable react/no-unescaped-entities */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@theme/components/Button';
import NewsletterForm from '@theme/components/NewsletterForm';
import VisuallyHidden from '@theme/components/VisuallyHidden';
import Layout from '@theme/layout';
import { ExternalIcon, TwitterIcon } from '@theme/components/Icons';
import { getAllFilesFrontMatter } from 'lib/mdx';
import { Post, PostType } from 'types/post';
import Grid from '@theme/components/Grid';

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
          <div
            css={css`
              display: flex;
              justify-content: space-between;
              width: 310px;
            `}
          >
            <a
              href="https://maximeheckel.com"
              style={{ textDecoration: 'none' }}
              tabIndex={-1}
            >
              <Button tertiary>
                <span
                  css={css`
                    padding-right: 8px;
                  `}
                >
                  About me
                </span>
                <ExternalIcon stroke="var(--maximeheckel-colors-brand)" />
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
              <Button tertiary>
                <span
                  css={css`
                    padding-right: 8px;
                  `}
                >
                  {' '}
                  @MaximeHeckel
                </span>
                <TwitterIcon stroke="var(--maximeheckel-colors-brand)" />
              </Button>
              <VisuallyHidden as="p">
                Link redirects to my Twitter profile page
                https://twitter.com/MaximeHeckel.
              </VisuallyHidden>
            </a>
          </div>
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
                      margin-left: -10px;
                    `}
                    key={post.slug}
                    data-testid="featured-article-item"
                    initial="initial"
                    whileHover="hover"
                  >
                    <Link href={`/posts/${post.slug}/`}>
                      <a style={{ textDecoration: `none` }}>
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
                        <Card
                          variants={cardVariants}
                          transition={{
                            type: 'tween',
                            ease: 'easeOut',
                            // delay: 0.15,
                            duration: 0.4,
                          }}
                        >
                          <TitleWithBackground background={post.colorFeatured!}>
                            {post.title}
                          </TitleWithBackground>
                          <p>{post.subtitle}</p>
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
                  <Link href={`/posts/${post.slug}/`}>
                    <a style={{ textDecoration: `none` }}>
                      <Block data-testid="article-link">
                        <DateBlock>
                          {format(new Date(Date.parse(post.date)), 'MMM dd')}
                        </DateBlock>
                        <TitleBlock>{post.title}</TitleBlock>
                      </Block>
                    </a>
                  </Link>
                </li>
              );
            })}
          </List>
          <br />
          <Card>
            <h3>#BlackLivesMatter</h3>
            <a href="https://blacklivesmatters.carrd.co/">
              Click here to find out how you can help.
            </a>
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
  border-radius: border-radius: var(--border-radius-2);
`;

const Card = styled(motion.div)`
  border-radius: var(--border-radius-2);
  margin-bottom: 0px;
  overflow: hidden;
  position: relative;
  background: var(--maximeheckel-card-background-color);
  box-shadow: var(--maximeheckel-shadow-1);
  position: relative;
  padding: 36px 24px;

  p {
    color: var(--maximeheckel-colors-typeface-secondary);
    margin-top: 1em;
  }
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

  &:hover {
    background-color: var(--maximeheckel-colors-foreground);
    box-shadow: var(--maximeheckel-shadow-1);
    color: var(--maximeheckel-colors-brand);
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

const TitleBlock = styled('div')`
  font-weight: 500;
`;

const List = styled(Grid)`
  margin-left: 0px;
  margin-bottom: 0px;

  li {
    list-style: none;
  }

  h3 {
    color: var(--maximeheckel-colors-typeface-primary);
  }
`;

export default IndexPage;
