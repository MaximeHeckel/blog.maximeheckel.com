import { css, Box, Flex, Grid, Icon, Text } from '@maximeheckel/design-system';
import siteConfig from 'config/site';
import { format } from 'date-fns';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Post, ReadingTime } from 'types/post';

import { BottomBlurGradientMask } from '@core/components/BottomBlurGradientMask';
import { useRegisterAction } from '@core/components/CommandMenu';
import { Dock } from '@core/components/Dock';
import { DynamicTOC } from '@core/components/DynamicTOC';
import Footer from '@core/components/Footer/Footer';
import { Main } from '@core/components/Main';
import { ScrambledText } from '@core/components/ScrambledText';
import Seo from '@core/components/Seo';

import { Footnote } from './Footnote';

const Header = (props: {
  title: string;
  ids: Array<{ id: string; title: string }>;
}) => {
  const { title, ids } = props;
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
            {hidden ? (
              <Box
                as={motion.div}
                key="dynamic-island"
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
    </Box>
  );
};

interface Props {
  children: React.ReactNode;
  frontMatter: Post & { readingTime: ReadingTime };
  ogImage: string;
}

const contentClass = css({
  padding: 'var(--space-6) 0px',
  color: 'var(--text-secondary)',

  h3: {
    paddingTop: '2.5rem',
  },

  p: {
    fontWeight: 'var(--font-weight-400)',
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
});

const BlogPost = ({ children, frontMatter, ogImage }: Props) => {
  const { date, updated, slug, subtitle, title, seoTitle } = frontMatter;
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

  useEffect(() => {
    /**
     * Working around some race condition quirks :) (don't judge)
     * TODO @MaximeHeckel: see if there's a better way through a remark plugin to do this
     */
    setTimeout(() => {
      const titles = document.querySelectorAll('h2');
      const idArrays = Array.prototype.slice
        .call(titles)
        .map((title) => ({ id: title.id, title: title.innerText })) as Array<{
        id: string;
        title: string;
      }>;
      setIds(idArrays);
    }, 500);
  }, [slug]);

  return (
    <Main>
      <Seo
        title={title}
        seoTitle={seoTitle}
        desc={subtitle}
        image={ogImage}
        path={path}
        date={date}
        updated={updated}
      />
      <Header title={title} ids={ids} />
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
        <Grid.Item
          col={2}
          justifySelf="center"
          css={{
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            gap: 'var(--space-3)',
            width: '100%',
            position: 'relative',

            '@sm': {
              minHeight: 'clamp(300px, 55dvh, 400px)',
            },
          }}
        >
          <Text
            as="h1"
            css={{
              fontWeight: 400,
              letterSpacing: '-1.0px',
              lineHeight: 1.2,
              textWrap: 'balance',
              textAlign: 'left',
            }}
            data-testid="post-title"
            family="serif"
            size="8"
            weight="3"
            variant="primary"
          >
            {title}
          </Text>
          <time itemProp="datepublished" dateTime={date}>
            <ScrambledText
              css={{
                whiteSpace: 'nowrap',
                transition: 'color 0.3s ease-in-out',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-1px',
                textTransform: 'uppercase',
              }}
              delay={0.5}
              speed={0.8}
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
            gap="5"
          >
            {children}
          </Flex>
        </Grid.Item>
      </Grid>
      <Footnote title={title} url={postUrl} />
      <BottomBlurGradientMask />
      <Footer lastUpdated={updated} />
    </Main>
  );
};

export { BlogPost };
