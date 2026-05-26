import { Box, Grid, Text } from '@maximeheckel/design-system';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { useInView } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { Post } from 'types/post';

import { ScrambledText } from '@core/components/ScrambledText';
import ViewTransitionLink from '@core/components/ViewTransitionLink';
import { useShouldSkipArticlesScramble } from '@core/hooks/useArticlesScrambleNavigation';

// import { ViewFinderMarks } from './ViewFinderMarks';

interface ArticleSectionProps {
  posts: Post[];
}

const ArticlesSection = (props: ArticleSectionProps) => {
  const { posts } = props;

  const articleListRef = useRef<HTMLUListElement>(null);
  const [, setFocusedPost] = useState<string | null>(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const shouldSkipScramble = useShouldSkipArticlesScramble();

  const inView = useInView(articleListRef, {
    amount: 0.08,
    once: true,
  });
  const shouldAnimateScramble = inView && !shouldSkipScramble;

  let year = 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFocused = useCallback(
    debounce((value: string | null, options: { scroll?: boolean } = {}) => {
      setFocusedPost(value);

      if (options.scroll && value) {
        const element = document.getElementById(value);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50),
    []
  );

  return (
    <Grid.Item col={2}>
      <Box
        id="articles"
        data-testid="articles-list"
        ref={articleListRef}
        as="ul"
        onMouseLeave={() => {
          debouncedSetFocused(null);
          setIsKeyboardNav(false);
        }}
        onMouseMove={() => {
          setIsKeyboardNav(false);
        }}
        css={{
          listStyle: 'none',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 0 0 0',

          '@media (hover: hover) and (pointer: fine)': {
            '&:has([data-article-item]:hover) [data-article-year-label], &:has([data-article-item]:hover) [data-article-item]:not(:hover)':
              {
                opacity: 0.5,
              },
          },
        }}
      >
        {posts.map((post, index) => {
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
              data-testid="article-item"
              css={{
                '&:last-child a': {
                  borderBottom: 'none',
                  paddingBottom: 96,
                },
              }}
              key={post.slug}
            >
              <Box
                data-article-year-label
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingLeft: 'var(--space-4)',
                  paddingRight: 'var(--space-4)',
                  transition: 'opacity 0.2s ease-in-out',
                }}
                onMouseEnter={() => !isKeyboardNav && debouncedSetFocused(null)}
              >
                {printYear ? (
                  <Text
                    as="p"
                    weight="4"
                    css={{
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '-1px',
                      padding: 'var(--space-7) 0px var(--space-5) 0px',
                    }}
                    size="2"
                    variant="primary"
                  >
                    {currentYear}
                  </Text>
                ) : null}
              </Box>
              <Box
                as={ViewTransitionLink}
                id={post.slug}
                data-testid="article-link"
                data-article-item
                href={`/posts/${post.slug}/`}
                passHref
                css={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  columnGap: 24,
                  position: 'relative',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: 'var(--space-4)',
                  transition:
                    'border-color 0.3s ease-in-out, opacity 0.2s ease-in-out',
                  borderBottom: '1px solid var(--border-color)',
                  outline: 'none',

                  '&:hover': {
                    '& *': {
                      color: 'var(--text-primary) !important',
                    },
                  },

                  '&:focus': {
                    '& *': {
                      color: 'var(--text-primary) !important',
                    },
                  },
                }}
                onMouseEnter={() =>
                  !isKeyboardNav && debouncedSetFocused(post.slug)
                }
                onFocus={() => {
                  if (!isKeyboardNav) {
                    setIsKeyboardNav(true);
                  }

                  if (isKeyboardNav) {
                    debouncedSetFocused(post.slug, { scroll: true });
                  }
                }}
              >
                <Grid.Item
                  css={{
                    gridColumn: 'auto/span 5',
                  }}
                >
                  {shouldSkipScramble ? (
                    <Text
                      css={{
                        transition: 'color 0.3s ease-in-out',
                      }}
                      size="2"
                      weight="3"
                      variant="tertiary"
                    >
                      {post.title}
                    </Text>
                  ) : (
                    <ScrambledText
                      css={{
                        transition: 'color 0.3s ease-in-out',
                      }}
                      disabled={!shouldAnimateScramble}
                      delay={0.5 + index * 0.1}
                      windowSize={7}
                      speed={1.75}
                      size="2"
                      weight="3"
                      variant="tertiary"
                    >
                      {post.title}
                    </ScrambledText>
                  )}
                  {/* <AnimatePresence>
                    {focusedPost === post.slug ? (
                      <ViewFinderMarks text={post.title} />
                    ) : null}
                  </AnimatePresence> */}
                </Grid.Item>
                <Grid.Item justifySelf="end" css={{ gridColumn: '6' }}>
                  {shouldSkipScramble ? (
                    <Text
                      css={{
                        whiteSpace: 'nowrap',
                        transition: 'color 0.3s ease-in-out',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '-1px',
                        textTransform: 'uppercase',
                        fontSize: 13,
                      }}
                      size="2"
                      variant="tertiary"
                    >
                      {format(new Date(post.date), 'MMM dd')}
                    </Text>
                  ) : (
                    <ScrambledText
                      css={{
                        whiteSpace: 'nowrap',
                        transition: 'color 0.3s ease-in-out',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '-1px',
                        textTransform: 'uppercase',
                        fontSize: 13,
                      }}
                      disabled={!shouldAnimateScramble}
                      delay={0.5 + index * 0.05}
                      windowSize={7}
                      speed={0.8}
                      size="2"
                      variant="tertiary"
                    >
                      {format(new Date(post.date), 'MMM dd')}
                    </ScrambledText>
                  )}
                </Grid.Item>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Grid.Item>
  );
};

export { ArticlesSection };
