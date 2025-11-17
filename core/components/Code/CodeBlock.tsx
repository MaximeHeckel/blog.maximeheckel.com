import { Card, styled } from '@maximeheckel/design-system';
import { useScroll, useMotionValueEvent, useTransform } from 'motion/react';
import { Highlight, Prism } from 'prism-react-renderer';
import { useLayoutEffect, useRef } from 'react';

import CopyToClipboardButton from '../Buttons/CopyToClipboardButton';
import { CodeBlockProps, HighlightedCodeTextProps } from './types';
import { calculateLinesToHighlight, hasTitle } from './utils';

// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;

/**
 * This imports the syntax highlighting style for the Swift and GLSLlanguage
 */

require('prismjs/components/prism-swift');
require('prismjs/components/prism-glsl');

export const HighlightedCodeText = (props: HighlightedCodeTextProps) => {
  const { codeString, language, highlightLine } = props;
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

  if (!codeString) return null;

  return (
    <Highlight
      theme={{ plain: {}, styles: [] }}
      code={codeString}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Pre ref={preRef} className={className} style={style}>
          {tokens.map((line, index) => {
            const { className: lineClassName } = getLineProps({
              className:
                highlightLine && highlightLine(index) ? 'highlight-line' : '',
              key: index,
              line,
            });

            return (
              <Line
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
                  {line.map((token, key) => {
                    return (
                      <span
                        data-testid="content-line"
                        key={key}
                        {...getTokenProps({
                          key,
                          token,
                        })}
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

  const highlightLineFn = calculateLinesToHighlight(metastring);
  const title = hasTitle(metastring);

  return (
    <Card
      css={{
        // Fix the overflow issue when wrapped in text
        display: 'grid',
        background: 'unset',
        width: '100%',

        '@media(max-width: 750px)': {
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
        },
      }}
    >
      {title ? (
        <Card.Header
          css={{
            zIndex: 3,
            backgroundColor: 'var(--code-snippet-background)',
            padding: 'var(--space-2) var(--space-3)',
          }}
        >
          <CodeSnippetTitle data-testid="codesnippet-title">
            {title}
          </CodeSnippetTitle>
          <CopyToClipboardButton title={title} text={codeString} />
        </Card.Header>
      ) : null}
      <HighlightedCodeText
        codeString={codeString}
        language={language}
        highlightLine={highlightLineFn}
      />
    </Card>
  );
};

export default CodeBlock;

const Pre = styled('pre', {
  '--shadow-size': '70px',
  '--shadow-color': 'oklch(from var(--gray-000) l c h / 0.75)',
  marginTop: '0',
  marginBottom: '0',
  textAlign: 'left',
  padding: 'var(--space-2) 0px',
  borderBottomLeftRadius: 'var(--border-radius-2)',
  borderBottomRightRadius: 'var(--border-radius-2)',
  backgroundColor: 'var(--code-snippet-background)',
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

  '.token.parameter,.token.imports,.token.plain,.token.comment,.token.prolog,.token.doctype,.token.cdata':
    {
      color: 'var(--token-comment)',
    },

  '.token.punctuation': {
    color: 'var(--token-punctuation)',
  },

  '.token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted':
    {
      color: 'var(--token-symbol)',
    },

  '.token.selector,.token.attr-name,.token.char,.token.builtin,.token.number,.token.string,.token.inserted':
    {
      color: 'var(--token-selector)',
    },

  '.token.operator,.token.entity,.token.url,.language-css .style': {
    color: 'var(--token-operator)',
  },

  '.token.atrule,.token.attr-value,.token.keyword': {
    color: 'var(--token-keyword)',
  },

  '.token.function,.token.maybe-class-name,.token.class-name': {
    color: 'var(--token-function)',
  },

  '.token.regex,.token.important,.token.variable': {
    color: 'var(--token-operator)',
  },
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

  '&:hover': {
    backgroundColor: 'var(--emphasis)',
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
  fontSize: 'var(--font-size-1)',
  marginBottom: '0px',
  color: 'var(--text-primary)',
  fontWeight: '500',
});
