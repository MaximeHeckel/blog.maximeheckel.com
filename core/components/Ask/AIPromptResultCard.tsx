import {
  Box,
  Card,
  Flex,
  Anchor,
  Pill,
  Text,
  List,
} from '@maximeheckel/design-system';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ForwardedRef, forwardRef, useCallback, useId, useRef } from 'react';

import { CustomGlassMaterial } from '../DialogGlass';
import { Answer } from './Answer';
import { AskError, Status } from './types';

interface AIPromtResultCardProps {
  error: AskError | null;
  sources: Array<{ title?: string; url?: string }> | undefined;
  status: Status;
  query: string;
  streamData: string;
  onQuestionSelect: (question: string) => void;
}

const SAMPLE_QUESTIONS = [
  'Use of shader in R3F',
  'Code: staggered animations',
  "Example on how to use Framer Motion's LayoutGroup",
  'Show me how to compose CSS variables',
  "Tell me about Maxime's first Three.js project",
  'What is the difference between varyings and uniforms?',
  'How to build a refraction shader?',
  "What's the difference between a vertex shader and a fragment shader?",
  'How did Maxime manage to store his Apple Watch health data?',
  "What's a great use case for render targets?",
];

const AIPromptResultCard = forwardRef(
  (props: AIPromtResultCardProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { error, sources, streamData, query, status, onQuestionSelect } =
      props;

    const scrollableContentRef = useRef<HTMLDivElement>(null);
    const sourcesTitleId = useId();
    const shouldReduceMotion = useReducedMotion();
    const scrollToBottom = useCallback(() => {
      const container = scrollableContentRef.current;
      if (!container) return;
      container.scrollTo({
        top: container.scrollHeight,
        behavior:
          status === 'done' && !shouldReduceMotion ? 'smooth' : 'instant',
      });
    }, [status, shouldReduceMotion]);

    return (
      <Card
        as={motion.div}
        data-testid="ai-prompt-result-card"
        initial={{ y: 0, opacity: 0, height: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          height: 500,
          transition: {
            delay: 0.6,
            ease: 'easeInOut',
            opacity: {
              delay: 1.2,
            },
          },
        }}
        exit={{
          y: -500,
          opacity: 0.1,
          height: 0,
        }}
        css={{
          width: '100%',
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: 'none',
          position: 'relative',
          'p, li, strong, em': {
            margin: '0px 0px 1rem',
            fontSize: 'var(--font-size-1)!important',
          },
          code: {
            fontSize: 'var(--font-size-1)',
          },
          'div:has(> pre)': {
            marginBottom: 'var(--space-5)',
          },
          overflow: 'visible',
        }}
        transition={{
          duration: 0.3,
          delay: 0.1,
          ease: 'easeIn',
        }}
      >
        <CustomGlassMaterial style={{ '--opacity': 0.84 }} />
        <Box css={{ borderRadius: 'inherit', height: '100%' }} ref={ref}>
          <Card.Body
            ref={scrollableContentRef}
            css={{
              padding: 24,
              maxHeight: 500,
              height: '100%',
            }}
            data-testid="ai-prompt-serialized-response"
            style={{ overflowY: status === 'loading' ? 'hidden' : 'auto' }}
          >
            <AnimatePresence initial={false}>
              {query ? (
                <Text
                  as={motion.em}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.5 },
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  exit={{
                    opacity: 0.2,
                    y: -30,
                    transition: {
                      ease: 'easeInOut',
                      duration: 0.3,
                    },
                  }}
                  key={query}
                  variant="tertiary"
                >
                  &quot;{query}&quot;
                </Text>
              ) : null}
              {!streamData && !query && status === 'initial' ? (
                <Flex
                  as={motion.div}
                  direction="column"
                  justifyContent="space-between"
                  gap="3"
                  exit={{
                    y: 20,
                    opacity: 0,
                    transition: {
                      ease: 'easeInOut',
                      duration: 0.2,
                    },
                  }}
                >
                  <Text
                    as="p"
                    css={{ marginBottom: '0px !important' }}
                    size="2"
                  >
                    Ask anything about my blog posts, a topic, or projects by
                    typing your question or selecting one of the examples below.
                  </Text>
                  <Flex wrap="wrap" gap="3">
                    {SAMPLE_QUESTIONS.map((question) => (
                      <Box
                        as="button"
                        css={{
                          padding: 0,
                          MozAppearance: 'none',
                          WebkitAppearance: 'none',
                          background: 'transparent',
                          color: 'inherit',
                          border: 'none',
                          fontFamily: 'inherit',
                        }}
                        key={question}
                        onClick={() => onQuestionSelect(question)}
                      >
                        <Pill css={{ cursor: 'pointer' }} variant="info">
                          {question}
                        </Pill>
                      </Box>
                    ))}
                  </Flex>
                  <Text as="p" size="2">
                    Results are sadly not guaranteed to be 100% accurate but
                    I&apos;ll work on improving the quality of the answers as I
                    learn more about the underlying technologies. If you want to
                    learn more about how I build it you can read my blog post
                    titled{' '}
                    <Link href="/posts/building-magical-ai-powered-semantic-search">
                      {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */}
                      Building a magical AI-powered semantic search from scratch
                    </Link>{' '}
                    where I go through all the implementation details.
                    <br />
                    <br />
                    Have fun!
                    <br />– Maxime
                  </Text>
                </Flex>
              ) : null}
            </AnimatePresence>
            {error ? (
              <Text as="p" size="2" variant="danger">
                {error.status} {error.statusText}. Please give it another try
                later.
              </Text>
            ) : null}
            <Answer text={streamData} onRender={scrollToBottom} />
            {status === 'done' && sources?.length ? (
              <Box
                as={motion.section}
                aria-labelledby={sourcesTitleId}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.25,
                  ease: 'easeOut',
                }}
                css={{
                  marginTop: 'var(--space-4)',
                  'li:last-child': { marginBottom: 0 },
                }}
              >
                <Text
                  as="h3"
                  id={sourcesTitleId}
                  size="1"
                  weight="2"
                  css={{ margin: '0 0 var(--space-3)' }}
                >
                  Sources
                </Text>
                <List variant="unordered">
                  {sources.map((source) => (
                    <List.Item key={source.url}>
                      <Anchor
                        href={source.url}
                        key={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                        underline
                      >
                        {source.title}
                      </Anchor>
                    </List.Item>
                  ))}
                </List>
              </Box>
            ) : null}
          </Card.Body>
        </Box>
      </Card>
    );
  }
);

export default AIPromptResultCard;
