import Card from '@theme/components/Card';
import { styled } from 'lib/stitches.config';
import Highlight, { Prism, defaultProps } from 'prism-react-renderer';
import CopyToClipboardButton from '../Button/CopyToClipboardButton';
import { CodeBlockProps, HighlightedCodeTextProps } from './types';
import { calculateLinesToHighlight, hasTitle } from './utils';

// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;

/**
 * This imports the syntax highlighting style for the Swift language
 */
require('prismjs/components/prism-swift');

export const HighlightedCodeText = (props: HighlightedCodeTextProps) => {
  const { codeString, language, highlightLine } = props;

  return (
    <Highlight
      {...defaultProps}
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
        marginBottom: '32px',
        background: 'unset',

        '@media(max-width: 750px)': {
          /**
           * Make it fullbleed!
           */
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          borderRadius: '0px',
        },
      }}
    >
      {title ? (
        <Card.Header
          css={{
            padding: '0px 16px',
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
  padding: '8px 0px',
  overflow: 'auto',
  borderBottomLeftRadius: 'var(--border-radius-2)',
  borderBottomRightRadius: 'var(--border-radius-2)',
});

const Line = styled('div', {
  display: 'table',
  borderCollapse: 'collapse',
  padding: '0px 14px',
  borderLeft: '3px solid transparent',

  '&.highlight-line': {
    background: 'var(--maximeheckel-colors-emphasis)',
    borderColor: 'var(--maximeheckel-colors-brand)',
  },

  '&:hover': {
    backgroundColor: 'var(--maximeheckel-colors-emphasis)',
  },
});

const LineNo = styled('div', {
  width: '45px',
  padding: '0 12px',
  userSelect: 'none',
  opacity: '1',
  color: 'var(--maximeheckel-colors-typeface-tertiary)',
});

const LineContent = styled('span', {
  display: 'table-cell',
  width: '100%',
});

const CodeSnippetTitle = styled('p', {
  fontSize: '14px',
  marginBottom: '0px',
  color: 'var(--maximeheckel-colors-typeface-primary)',
  fontWeight: '500',
});

// const CodeSnippetHeader = styled('div', {
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   borderTopLeftRadius: 'var(--border-radius-2)',
//   borderTopRightRadius: 'var(--border-radius-2)',
//   minHeight: '50px',
//   padding: '0px 14px',
//   backgroundColor: 'var(--code-snippet-background)',
//   borderBottom: '1px solid var(--maximeheckel-border-color)',
// });

// const CodeSnippetWrapper = styled('div', {
//   borderRadius: 'var(--border-radius-2)',
//   boxShadow: 'var(--maximeheckel-shadow-1)',
//   border: '1px solid var(--maximeheckel-border-color)',
//   marginBottom: '32px',

//   '@media(max-width: 750px)': {
//     /**
//      * Make it fullbleed!
//      */
//     width: '100vw',
//     position: 'relative',
//     left: '50%',
//     right: '50%',
//     marginLeft: '-50vw',
//     marginRight: '-50vw',
//     borderRadius: '0px',
//   },
// });
