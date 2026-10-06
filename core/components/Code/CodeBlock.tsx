import { Card, Flex, styled } from '@maximeheckel/design-system';
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { Highlight } from 'prism-react-renderer';
import { FocusEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { SendToAskButton } from '../Ask/SendToAskButton';
import CopyToClipboardButton from '../Buttons/CopyToClipboardButton';
import { createDiffHighlighter } from './diff';
import { syntaxTheme, syntaxTokenStyles } from './syntaxTheme';
import { CodeBlockProps, HighlightedCodeTextProps } from './types';
import { calculateLinesToHighlight, hasTitle } from './utils';

export const HighlightedCodeText = (props: HighlightedCodeTextProps) => {
  // A streamed code fence can be empty before its first code token arrives.
  // Mount scroll tracking only when there is a <pre> to attach to.
  if (!props.codeString) return null;

  return <ScrollableCodeText {...props} />;
};

const ScrollableCodeText = (props: HighlightedCodeTextProps) => {
  const { codeString, language, highlightLine } = props;
  const { prism, syntaxHighlighted } = useMemo(
    () => createDiffHighlighter(language),
    [language]
  );
  const isDiff = /^diff(?:-|$)/i.test(language);
  const preRef = useRef<HTMLPreElement>(null);

  const { scrollX } = useScroll({
    container: preRef,
  });

  const adjustedScrollXProgress = useTransform(scrollX, [10, 50], [0, 1]);

  useMotionValueEvent(adjustedScrollXProgress, 'change', (latestValue) => {
    if (!preRef.current) return;
    if (preRef.current.scrollWidth <= preRef.current.clientWidth) {
      preRef.current.style.setProperty('--shadow-opacity-left', '0');
      preRef.current.style.setProperty('--shadow-opacity-right', '0');
      return;
    }

    preRef.current.style.setProperty(
      '--shadow-opacity-left',
      latestValue.toString()
    );
    preRef.current.style.setProperty(
      '--shadow-opacity-right',
      (1 - latestValue).toString()
    );
  });

  useLayoutEffect(() => {
    if (!preRef.current) return;
    if (preRef.current.scrollWidth <= preRef.current.clientWidth) {
      preRef.current.style.setProperty('--shadow-opacity-left', '0');
      preRef.current.style.setProperty('--shadow-opacity-right', '0');
      return;
    }

    preRef.current.style.setProperty('--shadow-opacity-right', '1');
  }, []);

  return (
    <Highlight
      prism={prism}
      theme={{ plain: {}, styles: [] }}
      code={codeString}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Pre ref={preRef} className={className} style={style}>
          {tokens.map((line, index) => {
            const diffToken = isDiff
              ? line.find(
                  (token) =>
                    token.content &&
                    (token.types.includes('inserted') ||
                      token.types.includes('deleted'))
                )
              : undefined;
            const diffKind = diffToken
              ? diffToken.types.includes('inserted')
                ? 'added'
                : 'removed'
              : undefined;
            const { className: lineClassName } = getLineProps({
              className:
                highlightLine && highlightLine(index) ? 'highlight-line' : '',
              key: index,
              line,
            });

            return (
              <Line
                data-diff={diffKind}
                data-diff-syntax={syntaxHighlighted || undefined}
                data-testid={
                  highlightLine && highlightLine(index)
                    ? 'highlight-line'
                    : 'line'
                }
                key={index}
                className={lineClassName}
              >
                <LineNo data-testid="number-line">{index + 1}</LineNo>
                <LineContent>
                  {line.map((token, tokenIndex) => {
                    const { key: _key, ...tokenProps } = getTokenProps({
                      token,
                      key: tokenIndex,
                    });
                    return (
                      <span
                        data-testid="content-line"
                        data-arrow={
                          (token.types.includes('operator') &&
                            token.content === '=>') ||
                          undefined
                        }
                        key={tokenIndex}
                        {...tokenProps}
                      />
                    );
                  })}
                </LineContent>
              </Line>
            );
          })}
        </Pre>
      )}
    </Highlight>
  );
};

const CodeBlock = (props: CodeBlockProps) => {
  const { codeString, language, metastring } = props;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const actionsVisible = hovered || focused;

  if (!codeString?.trim()) return null;

  const highlightLineFn = calculateLinesToHighlight(metastring);
  const title = hasTitle(metastring);
  const actions = (
    <Flex css={{ gap: 0 }}>
      <SendToAskButton
        code={codeString}
        language={language}
        title={title || undefined}
      />
      <CopyToClipboardButton title={title} text={codeString} />
    </Flex>
  );

  return (
    <Card
      data-code-block
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      css={{
        position: 'relative',
        // Fix the overflow issue when wrapped in text
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        minWidth: 0,
        background: 'unset',
        width: '100%',
        borderRadius: 'var(--code-block-radius, var(--border-radius-2))',

        '@media(max-width: 750px)': {
          width: 'calc(100% + var(--code-block-bleed, var(--space-2)) * 2)',
          left: 'calc(-1 * var(--code-block-bleed, var(--space-2)))',
        },
      }}
    >
      {title ? (
        <Card.Header
          css={{
            borderBottom: 'none',
            borderTopLeftRadius:
              'var(--code-block-radius, var(--border-radius-1))',
            borderTopRightRadius:
              'var(--code-block-radius, var(--border-radius-1))',
            backgroundColor: 'var(--code-snippet-background)',
            padding: 'var(--space-2) var(--space-3)',
          }}
        >
          <CodeSnippetTitle data-testid="codesnippet-title">
            {title}
          </CodeSnippetTitle>
          {actions}
        </Card.Header>
      ) : (
        <FloatingActions
          role="group"
          aria-label="Code actions"
          initial={false}
          animate={{
            opacity: actionsVisible ? 1 : 0,
            y: actionsVisible || reducedMotion ? 0 : -4,
            scale: actionsVisible || reducedMotion ? 1 : 0.96,
          }}
          transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          style={{ pointerEvents: actionsVisible ? 'auto' : 'none' }}
        >
          {actions}
        </FloatingActions>
      )}
      <HighlightedCodeText
        codeString={codeString}
        language={language}
        highlightLine={highlightLineFn}
      />
    </Card>
  );
};

export default CodeBlock;

const FloatingActions = styled(motion.div, {
  position: 'absolute',
  // Center on the first code line (24px tall), regardless of the button height.
  top: 'calc(var(--space-2) + 12px)',
  translate: '0 -50%',
  right: 'var(--space-2)',
  zIndex: 3,
  borderRadius: 'var(--border-radius-2)',
  background: 'var(--code-snippet-background)',
  boxShadow: '0 2px 8px oklch(0% 0 0 / 12%)',
  // Touch devices have no hover affordance; keep the actions available.
  '@media (hover: none)': {
    opacity: '1 !important',
    transform: 'none !important',
    pointerEvents: 'auto !important',
  },
});

const Pre = styled('pre', {
  ...syntaxTheme,
  '--shadow-size': '70px',
  '--shadow-color': 'oklch(from var(--gray-000) l c h / 0.75)',
  marginTop: '0',
  marginBottom: '0',
  textAlign: 'left',
  padding: 'var(--space-2) 0px',
  borderBottomLeftRadius: 'var(--code-block-radius, var(--border-radius-2))',
  borderBottomRightRadius: 'var(--code-block-radius, var(--border-radius-2))',
  backgroundColor: 'var(--code-snippet-background)',
  color: 'var(--token-text)',
  fontFamily: 'var(--font-mono-code)',
  fontSize: 'var(--font-size-1)',
  lineHeight: '24px',
  overflowX: 'auto',

  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '0',
    width: 'var(--shadow-size, 40px)',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '2',
  },

  '&::before': {
    left: '0',
    opacity: 'var(--shadow-opacity-left, 0)',
    background: 'linear-gradient(to right, var(--shadow-color), transparent)',
  },

  '&::after': {
    right: '0',

    opacity: 'var(--shadow-opacity-right, 0)',
    background: 'linear-gradient(to left, var(--shadow-color), transparent)',
  },

  ...syntaxTokenStyles,
});

const Line = styled('div', {
  display: 'table',
  borderCollapse: 'collapse',
  padding: '0px 14px',
  borderLeft: '3px solid transparent',

  '&.highlight-line': {
    background: 'var(--emphasis)',
    borderColor: 'var(--accent)',
  },

  '&[data-diff="added"]': {
    width: '100%',
    backgroundColor: 'oklch(from var(--green-1100) l c h / 0.12)',
    '&:not([data-diff-syntax]) .token, .token.prefix': {
      color: 'var(--green-1100)',
    },
  },

  '&[data-diff="removed"]': {
    width: '100%',
    backgroundColor: 'oklch(from var(--red-1100) l c h / 0.12)',
    '&:not([data-diff-syntax]) .token, .token.prefix': {
      color: 'var(--red-1100)',
    },
  },
});

const LineNo = styled('div', {
  width: '45px',
  padding: '0 12px',
  userSelect: 'none',
  opacity: '1',
  color: 'var(--text-tertiary)',
});

const LineContent = styled('span', {
  display: 'table-cell',
  width: '100%',
});

const CodeSnippetTitle = styled('p', {
  marginBlockStart: '0px',
  marginInlineStart: '4px',
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase',
  fontSize: '13px',
  marginBottom: '0px',
  color: 'var(--text-tertiary)',
  fontWeight: '500',
});
