/* eslint-disable react/no-unescaped-entities */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import Button from '@theme/components/Button';
import NewsletterForm from '@theme/components/NewsletterForm';
import VisuallyHidden from '@theme/components/VisuallyHidden';
import Layout from '@theme/layouts';
import { getAllFilesFrontMatter } from 'lib/mdx';
import { Post, PostType } from 'types/post';

interface Props {
  posts: Post[];
}

const TwitterIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="var(--maximeheckel-colors-typeface-2)"
  >
    <path
      d="M23.8618 2.9995C22.9042 3.67497 21.8439 4.19161 20.7218 4.5295C20.1196 3.83701 19.3192 3.34619 18.4289 3.12342C17.5386 2.90066 16.6013 2.95669 15.7439 3.28395C14.8865 3.61121 14.1503 4.1939 13.6348 4.95321C13.1193 5.71253 12.8495 6.61183 12.8618 7.5295V8.5295C11.1044 8.57506 9.36309 8.18531 7.79283 7.39494C6.22256 6.60458 4.87213 5.43813 3.86182 3.9995C3.86182 3.9995 -0.138184 12.9995 8.86182 16.9995C6.80234 18.3975 4.34897 19.0984 1.86182 18.9995C10.8618 23.9995 21.7818 18.8949 21.7818 7.39494C21.7809 7.1164 21.8341 6.94309 21.7818 6.6695C22.8024 5.66299 23.5226 4.39221 23.8618 2.9995Z"
      stroke="var(--maximeheckel-colors-brand)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExternalIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="var(--maximeheckel-colors-typeface-2)"
  >
    <path
      d="M18.4282 13.5736V19.5736C18.4282 20.104 18.2175 20.6127 17.8424 20.9878C17.4674 21.3629 16.9587 21.5736 16.4282 21.5736H5.42822C4.89779 21.5736 4.38908 21.3629 4.01401 20.9878C3.63894 20.6127 3.42822 20.104 3.42822 19.5736V8.57361C3.42822 8.04318 3.63894 7.53447 4.01401 7.15939C4.38908 6.78432 4.89779 6.57361 5.42822 6.57361H11.4282"
      stroke="var(--maximeheckel-colors-brand)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.4282 3.57361H21.4282V9.57361"
      stroke="var(--maximeheckel-colors-brand)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.4282 14.5736L21.4282 3.57361"
      stroke="var(--maximeheckel-colors-brand)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    <>
      <Layout footer={true} header={true} headerProps={{ search: true }}>
        <main>
          <div
            css={css`
              margin-top: 100px;
              padding-bottom: 10px;
            `}
          >
            <br />
            <h1>
              Hi <WavingHand /> I'm Maxime, and this is my blog.{' '}
              <span
                css={css`
                  color: var(--maximeheckel-colors-typeface-2);
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
                  <ExternalIcon />
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
                  <TwitterIcon />
                </Button>
                <VisuallyHidden as="p">
                  Link redirects to my Twitter profile page
                  https://twitter.com/MaximeHeckel.
                </VisuallyHidden>
              </a>
            </div>
            {/* <div
              css={css`
                position: relative;
                width: 100%;
                height: 300px;
              `}
            >
              <Image
                src="/static/images/pawel-czerwinski-Hu6kULsI5dM-unsplash.jpg"
                layout="fill"
              />
            </div> */}
            <section
              css={css`
                margin-top: 100px;
              `}
            >
              <h2>Newsletter</h2>
              <NewsletterForm large />
            </section>
            <section
              css={css`
                margin-top: 100px;
              `}
            >
              <h2>Featured</h2>
              <List
                data-testid="featured-list"
                css={css`
                  display: grid;
                  grid-gap: 16px;
                `}
              >
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
                              <TitleWithBackground
                                background={post.colorFeatured!}
                              >
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
            <section
              css={css`
                margin-top: 100px;
              `}
            >
              <h2>All articles</h2>
              <List data-testid="article-list">
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
                              {format(
                                new Date(Date.parse(post.date)),
                                'MMM dd'
                              )}
                            </DateBlock>
                            <TitleBlock>{post.title}</TitleBlock>
                          </Block>
                        </a>
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
        </main>
      </Layout>
    </>
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
  background: var(--maximeheckel-colors-foreground);
  box-shadow: var(--maximeheckel-shadow-1);
  position: relative;
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
  padding: 30px 0px;
  font-weight: 600;
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
