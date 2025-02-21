import {
  Box,
  Flex,
  GlassMaterial,
  Grid,
  Text,
} from '@maximeheckel/design-system';
import { format } from 'date-fns';
import { getAllFilesFrontMatter } from 'lib/mdx';
import debounce from 'lodash.debounce';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Post } from 'types/post';

import Logo from '@core/components/Logo';
import { ScrambledText } from '@core/components/ScrambledText';
import { Scene } from '@core/features/IndexSection/Scene';

const Search = dynamic(() => import('@core/components/Search'));

interface Props {
  posts: Post[];
}

enum NAV {
  INDEX = 'Index',
  CMD = 'Cmd',
  ASK = 'Ask',
}

// ADD page metadata at the bottom
// time
// dimensions
// location?

const Dock = () => {
  const [focused, setFocused] = useState<NAV | null>(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIModeOpen, setIsAIModeOpen] = useState(false);

  const navItems = Object.values(NAV);
  const navActions = {
    [NAV.INDEX]: () => {},
    [NAV.CMD]: () => {
      setIsSearchOpen(true);
    },
    [NAV.ASK]: () => {
      setIsAIModeOpen(true);
    },
  };
  const navLinks = {
    [NAV.INDEX]: '/',
    [NAV.CMD]: undefined,
    [NAV.ASK]: undefined,
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    setIsKeyboardNav(true);
    const currentIndex = focused ? navItems.indexOf(focused) : 0;

    switch (event.code) {
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % navItems.length;
        setFocused(navItems[nextIndex]);
        (
          document.querySelector(
            `[data-nav-item="${navItems[nextIndex]}"]`
          ) as HTMLElement
        )?.focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex =
          currentIndex - 1 < 0 ? navItems.length - 1 : currentIndex - 1;
        setFocused(navItems[prevIndex]);
        (
          document.querySelector(
            `[data-nav-item="${navItems[prevIndex]}"]`
          ) as HTMLElement
        )?.focus();
        break;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFocused = useCallback(
    debounce((value: NAV | null) => {
      setFocused(value);
    }, 100),
    []
  );

  return (
    <>
      <Search open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <Search
        open={isAIModeOpen}
        onClose={() => setIsAIModeOpen(false)}
        forceAIMode
      />
      <Box
        as="nav"
        css={{
          position: 'relative',
          '--thickness': '1.5px',
          borderRadius: 'var(--border-radius-2)',
        }}
      >
        <GlassMaterial />
        <Flex
          as="ul"
          css={{
            width: 'fit-content',
            margin: 0,
            padding: 8,
            gap: 0,
          }}
          onMouseLeave={() => {
            debouncedSetFocused(null);
            setIsKeyboardNav(false);
          }}
          onMouseMove={() => {
            if (isKeyboardNav) {
              setIsKeyboardNav(false);
            }
          }}
        >
          <Flex
            as="li"
            css={{
              paddingLeft: 4,
              // optical alignment
              marginBottom: 1,
            }}
          >
            <Logo alt="Logo" size={24} />
            <Box
              css={{
                width: 1,
                height: 24,
                backgroundColor: 'oklch(from var(--blue-500) l c h / 25%)',
                marginLeft: 12,
                marginRight: 4,
              }}
            />
          </Flex>
          {navItems.map((item) => (
            <Box
              as="li"
              key={item}
              css={{
                listStyle: 'none',
              }}
            >
              <Box
                as={navLinks[item] ? Link : 'button'}
                css={{
                  background: 'transparent',
                  display: 'block',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '0 12px',
                  textDecoration: 'none',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  '&:active': {
                    background: 'transparent',
                  },
                }}
                href={navLinks[item]}
                tabIndex={0}
                data-nav-item={item}
                onKeyDown={handleKeyDown}
                onClick={navActions[item]}
                onMouseEnter={() => !isKeyboardNav && debouncedSetFocused(item)}
                onFocus={() => debouncedSetFocused(item)}
              >
                <Text
                  css={{
                    letterSpacing: '-0.5px',
                  }}
                  size="2"
                  variant="primary"
                  weight="4"
                >
                  {item}
                </Text>
                <AnimatePresence>
                  {focused === item ? (
                    <motion.div
                      layoutId="highlight"
                      transition={{
                        layout: {
                          type: 'spring',
                          stiffness: 250,
                          damping: 27,
                          mass: 1,
                        },
                      }}
                      exit={{ '--opacity': 0 }}
                      animate={{ '--opacity': 0.2 }}
                      initial={{
                        '--opacity': 0,
                      }}
                      style={{
                        position: 'absolute',
                        top: -1,
                        left: 0,
                        width: '100%',
                        height: '26px',
                        zIndex: 0,
                      }}
                    >
                      <Box
                        css={{
                          backdropFilter: 'blur(2px)',
                          borderRadius: 8,
                          width: '100%',
                          height: '100%',

                          '@media (pointer: coarse)': {
                            display: 'none',
                          },
                        }}
                        style={{
                          background: 'var(--blue-400)',
                          opacity: 'var(--opacity)',
                        }}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
    </>
  );
};

const Header = () => {
  return (
    <Box
      as="header"
      css={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        marginTop: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
        pointerEvents: 'none',
      }}
    >
      <Grid css={{ height: 50 }} templateColumns="auto 1fr auto">
        <Grid.Item
          css={{
            pointerEvents: 'auto',
          }}
          col={2}
          justifySelf="center"
        >
          <Dock />
        </Grid.Item>
      </Grid>
    </Box>
  );
};

const NewHome = (props: Props) => {
  const { posts } = props;
  const [focusedPost, setFocusedPost] = useState<string | null>(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

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
    <>
      <Header />
      <Box
        as="main"
        css={{
          position: 'relative',
          height: 'auto',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--background)',
          transition:
            'background-color 0.3s ease-in-out, background 0.3s ease-in-out',

          '@lg': {
            height: '100dvh',
            minHeight: '600px',
          },
        }}
      >
        <Box
          id="bottom-blur-gradient-mask"
          css={{
            height: 96,
            width: '100%',
            transition: 'background 0.3s ease-in-out',
            background: 'oklch(from var(--background) l c h / 10%)',
            transform: 'translateZ(0)',
            willChange: 'transform',
            position: 'fixed',
            bottom: 0,
            right: 0,
            zIndex: 1,
            isolation: 'isolate',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
            maskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, black 50%)',

            '@lg': {
              width: 'calc(50% + 8px)',
            },
          }}
        />
        <Grid
          css={{
            height: '100%',
          }}
          templateColumns="repeat(6, 1fr)"
        >
          <Grid.Item
            css={{
              height: '100%',
              gridColumn: 'auto/span 6',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              width: '100%',
              minHeight: 300,
              aspectRatio: '1 / 1',

              '@lg': {
                aspectRatio: 'unset',
                gridColumn: 'auto/span 3',
              },
            }}
          >
            <Box
              css={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              }}
            >
              <Scene />
            </Box>
            <Box
              css={{
                position: 'relative',
                padding: 'var(--space-4) var(--space-4)',
                pointerEvents: 'auto',
                zIndex: 2,

                '@lg': {
                  padding: 'var(--space-4) var(--space-6)',
                },
              }}
            >
              <Text
                as="h1"
                css={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 44,
                  fontWeight: 400,
                  letterSpacing: '-2.0px',
                  lineHeight: 0.75,
                  width: '75%',
                  maxWidth: 450,
                  textWrap: 'balance',
                  transition: 'color 0.3s ease-in-out',
                }}
                variant="primary"
              >
                Essays & Experiments at the frontier of the{' '}
                <Text
                  as="span"
                  css={{
                    letterSpacing: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    fontStyle: 'italic',
                    transition: 'color 0.3s ease-in-out',
                  }}
                  variant="primary"
                >
                  web
                </Text>
                .
              </Text>
            </Box>
          </Grid.Item>
          <Grid.Item
            css={{
              height: '100%',
              gridColumn: 'auto/span 6',
              overflow: 'auto',
              position: 'relative',

              '@lg': {
                gridColumn: 'auto/span 3',
                borderTop: 'none',
                maskImage:
                  'linear-gradient(to bottom, transparent, black 70px, black 90%, transparent)',
                '&:before': {
                  position: 'fixed',
                  transition: 'background 0.3s ease-in-out',
                  background: 'var(--border-color)',
                  content: '""',
                  display: 'block',
                  width: '1px',
                  height: '100%',
                  left: '50%',
                },
              },
            }}
          >
            <Box
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
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',

                '@lg': {
                  padding: '64px 0 0 0',
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
                    css={{
                      '&:last-child a': {
                        borderBottom: 'none',
                        paddingBottom: 96,
                      },
                    }}
                    key={post.slug}
                  >
                    <Box
                      css={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: 'var(--space-4)',
                        paddingRight: 'var(--space-4)',
                      }}
                      onMouseEnter={() =>
                        !isKeyboardNav && debouncedSetFocused(null)
                      }
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
                          variant="tertiary"
                        >
                          {currentYear}
                        </Text>
                      ) : null}
                    </Box>
                    <Box
                      as={Link}
                      id={post.slug}
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
                        transition: 'border-color 0.3s ease-in-out',
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
                        setIsKeyboardNav(true);
                        debouncedSetFocused(post.slug, { scroll: true });
                      }}
                    >
                      <Grid.Item
                        css={{
                          gridColumn: 'auto/span 5',
                        }}
                      >
                        <ScrambledText
                          css={{
                            transition: 'color 0.3s ease-in-out',
                          }}
                          delay={0.5 + index * 0.05}
                          windowSize={7}
                          speed={1.15}
                          size="2"
                          weight="3"
                          variant="tertiary"
                        >
                          {post.title}
                        </ScrambledText>
                        <AnimatePresence>
                          {focusedPost === post.slug ? (
                            <ViewFinderMarks text={post.title} />
                          ) : null}
                        </AnimatePresence>
                      </Grid.Item>
                      <Grid.Item justifySelf="end" css={{ gridColumn: '6' }}>
                        <ScrambledText
                          css={{
                            whiteSpace: 'nowrap',
                            transition: 'color 0.3s ease-in-out',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '-1px',
                            textTransform: 'uppercase',
                            fontSize: 13,
                          }}
                          delay={0.5 + index * 0.05}
                          windowSize={7}
                          speed={0.8}
                          size="1"
                          variant="tertiary"
                        >
                          {format(new Date(post.date), 'MMM dd')}
                        </ScrambledText>
                      </Grid.Item>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid.Item>
        </Grid>
      </Box>
    </>
  );
};

export default NewHome;

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter();

  return { props: { posts } };
}

const ViewFinderMarks = ({ text }: { text: string }) => {
  return (
    <motion.div
      exit={{ '--opacity': 0 }}
      animate={{ '--opacity': 1 }}
      initial={{
        '--opacity': 0,
      }}
      style={{
        opacity: 'var(--opacity)',
        position: 'absolute',
        top: -6,
        left: -8,
        width: 'fit-content',
        height: 'calc(100% + 12px)',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Top Left */}
        <motion.div
          layoutId="top-left"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 12,
            height: 12,
            borderTop: '3px solid var(--accent)',
            borderLeft: '3px solid var(--accent)',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '1px',
            borderBottomLeftRadius: '1px',
          }}
        />

        {/* Top Right */}
        <motion.div
          layoutId="top-right"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 12,
            height: 12,
            borderTop: '3px solid var(--accent)',
            borderRight: '3px solid var(--accent)',
            borderTopRightRadius: '4px',
            borderTopLeftRadius: '1px',
            borderBottomRightRadius: '1px',
          }}
        />

        {/* Bottom Left */}
        <motion.div
          layoutId="bottom-left"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 12,
            height: 12,
            borderBottom: '3px solid var(--accent)',
            borderLeft: '3px solid var(--accent)',
            borderBottomLeftRadius: '4px',
            borderTopLeftRadius: '1px',
            borderBottomRightRadius: '1px',
          }}
        />

        {/* Bottom Right */}
        <motion.div
          layoutId="bottom-right"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
            },
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 12,
            height: 12,
            borderBottom: '3px solid var(--accent)',
            borderRight: '3px solid var(--accent)',
            borderBottomRightRadius: '4px',
            borderTopRightRadius: '1px',
            borderBottomLeftRadius: '1px',
          }}
        />
      </div>
      <Text
        aria-hidden
        as="p"
        css={{
          padding: '0px 8px',
          visibility: 'hidden',
        }}
        size="2"
        weight="3"
      >
        {text}
      </Text>
    </motion.div>
  );
};
