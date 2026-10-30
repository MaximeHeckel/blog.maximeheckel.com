import { Box, Grid, Text } from '@maximeheckel/design-system';
import { format } from 'date-fns';
import { useInView, useReducedMotion } from 'motion/react';
import {
  ComponentProps,
  FocusEvent,
  FocusEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Post } from 'types/post';

import { ScrambledText } from '@core/components/ScrambledText';
import ViewTransitionLink from '@core/components/ViewTransitionLink';

type ArticleTextProps = ComponentProps<typeof ScrambledText> & {
  animate: boolean;
};

const ArticleText = ({
  animate,
  children,
  css,
  delay,
  speed,
  ...props
}: ArticleTextProps) => (
  <Box css={{ position: 'relative' }}>
    {/* Keep the complete text in flow and accessible throughout the scramble. */}
    <Text {...props} css={{ ...css, opacity: animate ? 0 : 1 }}>
      {children}
    </Text>
    {animate ? (
      <Box
        aria-hidden
        css={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <ScrambledText
          {...props}
          css={css}
          delay={delay}
          speed={speed}
          windowSize={7}
        >
          {children}
        </ScrambledText>
      </Box>
    ) : null}
  </Box>
);

interface ArticleRowProps {
  post: Post;
  index: number;
  shouldSkipScramble: boolean;
  onMouseEnter: MouseEventHandler<HTMLAnchorElement>;
  onFocus: FocusEventHandler<HTMLAnchorElement>;
}

export const ArticleRow = ({
  post,
  index,
  shouldSkipScramble,
  onMouseEnter,
  onFocus,
}: ArticleRowProps) => {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const inView = useInView(rowRef, { amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const hasEntered = useRef(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (inView) {
      hasEntered.current = true;
    } else if (hasEntered.current) {
      // Unmount the animation on exit and never restart it on re-entry.
      setSettled(true);
    }
  }, [inView]);

  const animate =
    inView && !settled && !shouldSkipScramble && !shouldReduceMotion;
  // Preserve the opening stagger without making older rows wait for the whole list.
  const staggerIndex = Math.min(index, 4);

  return (
    <Box
      as={ViewTransitionLink}
      ref={rowRef}
      navigateOnPress
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
      onMouseEnter={onMouseEnter}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        setSettled(true);
        onFocus(event);
      }}
    >
      <Grid.Item css={{ gridColumn: 'auto/span 5' }}>
        <ArticleText
          animate={animate}
          delay={0.5 + staggerIndex * 0.1}
          speed={1.75}
          size="2"
          weight="3"
          variant="tertiary"
        >
          {post.title}
        </ArticleText>
      </Grid.Item>
      <Grid.Item justifySelf="end" css={{ gridColumn: '6' }}>
        <ArticleText
          animate={animate}
          css={{
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-1px',
            textTransform: 'uppercase',
            fontSize: 13,
          }}
          delay={0.5 + staggerIndex * 0.05}
          speed={0.8}
          size="2"
          variant="tertiary"
        >
          {format(new Date(post.date), 'MMM dd')}
        </ArticleText>
      </Grid.Item>
    </Box>
  );
};
