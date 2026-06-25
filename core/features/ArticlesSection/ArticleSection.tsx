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

/**
 * Tracks pointer hover within the articles list.
 *
 * - Session starts on the first article hover (`data-hover-session` on the list,
 *   `data-active` on that year section).
 * - Inactive year sections dim to 50% opacity (label + article content).
 * - First hover plays the full 0.3s dim animation.
 * - Moving between articles in the same year sets `instant: true` (`data-instant`
 *   on the section), so text color snaps while section dimming stays animated.
 * - Moving to a different year resets `instant`, replaying the dim out/in animation.
 * - Hovering a year label during a session keeps that year bright; other years stay dimmed.
 * - Hovering a year label alone does not start a session.
 * - Leaving the list clears the session; the next hover starts fresh.
 */
type HoverSession = {
  year: number;
  instant: boolean;
};

const ArticlesSection = (props: ArticleSectionProps) => {
  const { posts } = props;

  const articleListRef = useRef<HTMLUListElement>(null);
  const [, setFocusedPost] = useState<string | null>(null);
  const [hoverSession, setHoverSession] = useState<HoverSession | null>(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const shouldSkipScramble = useShouldSkipArticlesScramble();

  const inView = useInView(articleListRef, {
    amount: 0.08,
    once: true,
  });
  const shouldAnimateScramble = inView && !shouldSkipScramble;

  const postsByYear = posts.reduce<
    Array<{ year: number; posts: Array<{ post: Post; index: number }> }>
  >((groups, post, index) => {
    const currentYear = new Date(post.date).getFullYear();
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.year === currentYear) {
      lastGroup.posts.push({ post, index });
    } else {
      groups.push({ year: currentYear, posts: [{ post, index }] });
    }

    return groups;
  }, []);

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

  const endHoverSession = () => {
    debouncedSetFocused(null);
    setIsKeyboardNav(false);
    setHoverSession(null);
  };

  const focusYear = (year: number) => {
    if (isKeyboardNav) {
      return;
    }

    debouncedSetFocused(null);
    setHoverSession((session) => {
      if (!session) {
        return null;
      }

      if (session.year === year) {
        return session;
      }

      return { year, instant: false };
    });
  };

  const focusArticle = (year: number, slug: string) => {
    if (isKeyboardNav) {
      return;
    }

    setHoverSession((session) => {
      if (!session) {
        return { year, instant: false };
      }

      if (session.year === year) {
        return { year, instant: true };
      }

      return { year, instant: false };
    });
    debouncedSetFocused(slug);
  };

  return (
    <Grid.Item col={2}>
      <Box
        id="articles"
        data-testid="articles-list"
        ref={articleListRef}
        as="ul"
        data-hover-session={hoverSession ? '' : undefined}
        onMouseLeave={endHoverSession}
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
            // Dim inactive year sections while a hover session is open.
            '&[data-hover-session] [data-article-year-section]:not([data-active]) [data-article-year-label], &[data-hover-session] [data-article-year-section]:not([data-active]) [data-article-item] > *':
              {
                opacity: 0.5,
              },

            // Opacity: year labels and article columns fade with section dimming.
            '[data-article-year-section] [data-article-year-label], [data-article-item] > *':
              {
                transition: 'opacity 0.2s ease-in-out',
              },

            // Color: text inside article columns (not the columns themselves,
            // otherwise the transition shorthand overrides opacity on > *).
            '[data-article-item] > * *': {
              transition: 'color 0.125s ease-in-out',
            },

            // Snap text color when moving between articles in the same year.
            '[data-article-year-section][data-instant] [data-article-item] > * *':
              {
                transition: 'color 0s',
              },
          },
        }}
      >
        {postsByYear.map(({ year, posts: yearPosts }) => {
          const isActiveYear = hoverSession?.year === year;

          return (
            <Box
              as="li"
              data-article-year-section
              data-testid="article-year-section"
              data-active={isActiveYear || undefined}
              data-instant={
                isActiveYear && hoverSession?.instant ? '' : undefined
              }
              css={{
                '&:last-child [data-article-item]:last-child': {
                  borderBottom: 'none',
                  paddingBottom: 96,
                },
              }}
              key={year}
            >
              <Box
                data-article-year-label
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingLeft: 'var(--space-4)',
                  paddingRight: 'var(--space-4)',
                }}
                onMouseEnter={() => focusYear(year)}
              >
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
                  {year}
                </Text>
              </Box>
              {yearPosts.map(({ post, index }) => (
                <Box
                  as={ViewTransitionLink}
                  id={post.slug}
                  data-testid="article-link"
                  data-article-item
                  href={`/posts/${post.slug}/`}
                  passHref
                  key={post.slug}
                  css={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    columnGap: 24,
                    position: 'relative',
                    textDecoration: 'none',
                    fontWeight: 500,
                    padding: 'var(--space-4)',
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
                  onMouseEnter={() => focusArticle(year, post.slug)}
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
                      <Text size="2" weight="3" variant="tertiary">
                        {post.title}
                      </Text>
                    ) : (
                      <ScrambledText
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
              ))}
            </Box>
          );
        })}
      </Box>
    </Grid.Item>
  );
};

export { ArticlesSection };
