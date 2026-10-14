import { css, Box, Flex, Grid, Icon } from '@maximeheckel/design-system';
import siteConfig from 'config/site';
import { format } from 'date-fns';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Post, ReadingTime } from 'types/post';

import { SelectionToAsk } from '@core/components/Ask/SelectionToAsk';
import { BottomBlurGradientMask } from '@core/components/BottomBlurGradientMask';
import CopyToClipboardButton from '@core/components/Buttons/CopyToClipboardButton';
import { useRegisterAction } from '@core/components/CommandMenu';
import { Dock } from '@core/components/Dock';
import { DynamicTOC } from '@core/components/DynamicTOC';
import Footer from '@core/components/Footer/Footer';
import Headline from '@core/components/Headline';
import { DocumentIcon } from '@core/components/Icons';
import { Main } from '@core/components/Main';
import { ScrambledText } from '@core/components/ScrambledText';
import Seo from '@core/components/Seo';
import { useSkipArticlesScrambleWhenLeavingPost } from '@core/hooks/useArticlesScrambleNavigation';

import { Footnote } from './Footnote';
import { MarkdownArticle } from './MarkdownArticle';

import 'katex/dist/katex.min.css';

const Header = (props: {
  title: string;
  ids: Array<{ id: string; title: string }>;
  machine: boolean;
  markdown?: string;
}) => {
  const { title, ids, machine, markdown } = props;
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const hasReachedBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100;

    switch (true) {
      case hasReachedBottom:
        setHidden(false);
        break;
      case latest > 250:
        setHidden(true);
        break;
      default:
        setHidden(false);
    }
  });

  return (
    <Box
      as="header"
      css={{
        position: 'fixed',
        pointerEvents: 'none',
        top: 0,
        left: 0,
        right: 0,
        marginTop: 24,
        zIndex: 100,
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <Grid templateColumns="auto 1fr auto" gapY={3}>
        <Grid.Item col={2} justifySelf="center">
          <AnimatePresence initial={false} mode="wait">
            {hidden && !machine ? (
              <Box
                as={motion.div}
                key="dynamic-island"
                css={{ pointerEvents: 'auto' }}
                variants={{
                  visible: {
                    y: 0,
                    transition: shouldReduceMotion
                      ? {
                          duration: 0,
                        }
                      : {
                          delay: 0.1,
                          type: 'spring',
                          bounce: 0.4,
                        },
                  },
                  hidden: {
                    y: -68,
                    transition: shouldReduceMotion
                      ? {
                          duration: 0,
                        }
                      : {
                          delay: 0.4,
                          type: 'spring',
                          bounce: 0.4,
                        },
                  },
                }}
                exit="hidden"
                initial="hidden"
                animate="visible"
              >
                <DynamicTOC title={title} ids={ids} />
              </Box>
            ) : (
              <Box
                as={motion.div}
                key="dock"
                css={{ pointerEvents: 'auto' }}
                variants={{
                  visible: { y: 0 },
                  hidden: { y: -68 },
                }}
                exit="hidden"
                initial="hidden"
                animate="visible"
                transition={
                  shouldReduceMotion
                    ? {
                        duration: 0,
                      }
                    : {
                        type: 'spring',
                        bounce: 0.4,
                        delay: 0.1,
                      }
                }
              >
                <Dock />
              </Box>
            )}
          </AnimatePresence>
        </Grid.Item>
      </Grid>
      {machine && markdown !== undefined ? (
        <Box
          css={{
            position: 'absolute',
            right: 'var(--space-5)',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
            '@media (hover: none) and (pointer: coarse)': {
              display: 'none',
            },
          }}
        >
          <CopyToClipboardButton
            text={markdown}
            label="Copy Markdown to clipboard"
            variant="secondary"
            size="large"
          />
        </Box>
      ) : null}
    </Box>
  );
};

interface Props {
  children: React.ReactNode;
  frontMatter: Post & { readingTime: ReadingTime };
  ogImage: string;
  markdown?: string;
}

const contentClass = css({
  padding: 'var(--space-8) 0px',
  color: 'var(--text-secondary)',

  h3: {
    paddingTop: '2.5rem',
  },

  p: {
    fontWeight: 'var(--font-weight-400)',
    letterSpacing: '0.15px',
  },

  li: {
    fontWeight: 'var(--font-weight-400)',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-5)',
    maxWidth: 700,
    width: '100%',
  },

  '.katex-display>.katex>.katex-html>.tag': {
    display: 'none',
  },

  '.katex-display>.katex': {
    textAlign: 'left',
    whiteSpace: 'normal',
  },
});

const BlogPost = ({ children, frontMatter, ogImage, markdown }: Props) => {
  const articleRef = useRef<HTMLDivElement>(null);
  const { date, updated, slug, subtitle, title, seoTitle } = frontMatter;
  const router = useRouter();
  const machine = String(router.query.slug).endsWith('.md');
  const reducedMotion = useReducedMotion();
  const [animateMarkdown, setAnimateMarkdown] = useState(false);
  const loadingMode = useRef(false);
  const requestedModePath = useRef<string | null>(null);
  const scrollAfterTransition = useRef(false);
  const path = `/posts/${slug}/`;
  const postUrl = `${siteConfig.url}${path}`;

  const [ids, setIds] = React.useState<Array<{ id: string; title: string }>>(
    []
  );

  // Register copy link action in command menu
  const copyLinkAction = useMemo(
    () => ({
      id: 'copy-post-link',
      label: 'Copy link to clipboard',
      icon: Icon.Copy,
      keywords: ['share', 'url', 'copy'],
      onSelect: () => {
        navigator.clipboard.writeText(postUrl);
      },
    }),
    [postUrl]
  );
  useRegisterAction(copyLinkAction);
  useSkipArticlesScrambleWhenLeavingPost(router);

  const navigateMode = useCallback(() => {
    if (loadingMode.current) return;
    const nextMachine = !machine;
    const href = `/posts/${slug}${nextMachine ? '.md' : '/'}`;
    requestedModePath.current = href;
    scrollAfterTransition.current = true;
    loadingMode.current = true;
    void router
      .push(href, undefined, {
        scroll: false,
      })
      .catch((error: unknown) => {
        if (
          error &&
          typeof error === 'object' &&
          'cancelled' in error &&
          error.cancelled
        )
          return;
        window.location.assign(href);
      })
      .finally(() => {
        loadingMode.current = false;
      });
  }, [machine, router, slug]);

  const modeAction = useMemo(
    () => ({
      id: `article-mode-${slug}-${machine ? 'human' : 'machine'}`,
      label: machine ? 'Human version' : 'Machine version',
      icon: machine ? DocumentIcon : Icon.Code,
      keywords: machine
        ? ['human', 'read', 'article', 'format']
        : ['machine', 'markdown', 'mdx', 'source', 'format'],
      onSelect: navigateMode,
    }),
    [machine, navigateMode, slug]
  );
  useRegisterAction(modeAction);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Browser history and ordinary article links show the source immediately.
      setAnimateMarkdown(
        url === requestedModePath.current && url.endsWith('.md')
      );
      requestedModePath.current = null;
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  useEffect(() => {
    /**
     * Working around some race condition quirks :) (don't judge)
     * TODO @MaximeHeckel: see if there's a better way through a remark plugin to do this
     */
    const timer = setTimeout(() => {
      const titles = document.querySelectorAll('h2');
      const idArrays = Array.prototype.slice
        .call(titles)
        .map((title) => ({ id: title.id, title: title.innerText })) as Array<{
        id: string;
        title: string;
      }>;
      setIds(idArrays);
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, machine]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if (href) {
        const fullUrl = `${postUrl}${href}`;
        navigator.clipboard.writeText(fullUrl);
      }
    };

    const anchorLinks = document.querySelectorAll('.anchor-link');
    anchorLinks.forEach((link) => {
      link.addEventListener('click', handleAnchorClick as EventListener);
    });

    return () => {
      anchorLinks.forEach((link) => {
        link.removeEventListener('click', handleAnchorClick as EventListener);
      });
    };
  }, [postUrl, ids]);

  return (
    <Main>
      <Head>
        <link
          key="article-markdown"
          rel="alternate"
          type="text/markdown"
          href={`/api/posts/${slug}/`}
          title="Markdown"
        />
      </Head>
      <Seo
        title={title}
        seoTitle={seoTitle}
        desc={subtitle}
        image={ogImage}
        path={path}
        date={date}
        updated={updated}
      />
      <Header title={title} ids={ids} machine={machine} markdown={markdown} />
      <AnimatePresence
        initial={false}
        mode="wait"
        onExitComplete={() => {
          if (scrollAfterTransition.current) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            scrollAfterTransition.current = false;
          }
        }}
      >
        <motion.div
          key={`${slug}-${machine ? 'machine' : 'human'}`}
          initial={
            reducedMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }
          }
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 0, y: -8, filter: 'blur(4px)' }
          }
          transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeInOut' }}
        >
          <Grid
            as="article"
            css={{
              overflowX: 'hidden',
              position: 'relative',
              backgroundColor: 'var(--background)',
              borderBottomRightRadius: 4,
              borderBottomLeftRadius: 4,
            }}
            gapX={4}
            templateColumns="1fr minmax(auto, 663px) 1fr"
          >
            {machine && markdown !== undefined ? (
              <Grid.Item col={2} css={{ minWidth: 0 }}>
                <MarkdownArticle
                  markdown={markdown}
                  animateReveal={animateMarkdown}
                />
              </Grid.Item>
            ) : (
              <>
                <Grid.Item
                  col={2}
                  justifySelf="center"
                  css={{
                    minHeight: 300,
                    maxWidth: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'end',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    width: '100%',
                    position: 'relative',

                    '@sm': {
                      minHeight: 'clamp(250px, 50dvh, 375px)',
                    },
                  }}
                >
                  <Headline data-testid="post-title" textAlign="center">
                    {title}
                  </Headline>
                  <time itemProp="datepublished" dateTime={date}>
                    <ScrambledText
                      css={{
                        whiteSpace: 'nowrap',
                        transition: 'color 0.3s ease-in-out',
                        letterSpacing: '-1px',
                        textTransform: 'uppercase',
                      }}
                      delay={0.5}
                      speed={0.8}
                      family="mono"
                      size="1"
                      variant="tertiary"
                      windowSize={3}
                    >
                      {format(new Date(Date.parse(date)), 'MMM d, yyyy')}
                    </ScrambledText>
                  </time>
                </Grid.Item>
                <Grid.Item col={2}>
                  <Flex
                    alignItems="start"
                    direction="column"
                    className={contentClass()}
                    ref={articleRef}
                    data-ask-article-path={path}
                    data-ask-article-title={title}
                    data-ask-article-subtitle={subtitle}
                    gap="5"
                  >
                    {children}
                  </Flex>
                </Grid.Item>
              </>
            )}
          </Grid>
          {!machine ? (
            <>
              <SelectionToAsk articleRef={articleRef} title={title} />
              <Footnote title={title} url={postUrl} />
              <Footer lastUpdated={updated} />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
      <BottomBlurGradientMask />
    </Main>
  );
};

export { BlogPost };
