import { Card, styled } from '@maximeheckel/design-system';
import { Highlight, Prism } from 'prism-react-renderer';

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

  if (!codeString) return null;

  return (
    <Highlight
      theme={{ plain: {}, styles: [] }}
      code={codeString}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Pre className={className} style={style}>
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
            backgroundColor: 'var(--code-snippet-background)',
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
  marginTop: '0',
  marginBottom: '0',
  textAlign: 'left',
  padding: 'var(--space-2) 0px',
  overflow: 'auto',
  borderBottomLeftRadius: 'var(--border-radius-2)',
  borderBottomRightRadius: 'var(--border-radius-2)',
  backgroundColor: 'var(--code-snippet-background)',
  fontFamily: 'var(--font-mono-code)',
  fontSize: 'var(--font-size-1)',
  lineHeight: '24px',

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
