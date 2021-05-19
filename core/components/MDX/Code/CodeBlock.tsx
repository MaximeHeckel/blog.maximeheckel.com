import styled from '@emotion/styled';
import Highlight, { Prism, defaultProps } from 'prism-react-renderer';
import React from 'react';
import { CopyToClipboardButton } from '../../Button';
import { CodeBlockProps, HighlightedCodeTextProps } from './types';
import { calculateLinesToHighlight, hasTitle } from './utils';

// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;

/**
 * This imports the syntax highlighting style for the Swift language
 */
require('prismjs/components/prism-swift');

export const HighlightedCodeText = (props: HighlightedCodeTextProps) => {
  const { title, codeString, language, highlightLine } = props;

  return (
    <Highlight
      {...defaultProps}
      theme={{ plain: {}, styles: [] }}
      code={codeString}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <>
          <Pre title={title} className={className} style={style}>
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
        </>
      )}
    </Highlight>
  );
};

const CodeBlock = (props: CodeBlockProps) => {
  const { codeString, language, metastring } = props;

  const highlightLineFn = calculateLinesToHighlight(metastring);
  const title = hasTitle(metastring);

  return (
    <CodeSnippetWrapper>
      {title ? (
        <CodeSnippetHeader>
          <CodeSnippetTitle data-testid="codesnippet-title">
            {title}
          </CodeSnippetTitle>
          <CopyToClipboardButton title={title} text={codeString} />
        </CodeSnippetHeader>
      ) : null}
      <HighlightedCodeText
        title={title}
        codeString={codeString}
        language={language}
        highlightLine={highlightLineFn}
      />
    </CodeSnippetWrapper>
  );
};

export default CodeBlock;

const Pre = styled('pre')<{ title?: string }>`
  text-align: left;
  padding: 8px 0px;
  overflow: auto;
  border-bottom-left-radius: var(--border-radius-2);
  border-bottom-right-radius: var(--border-radius-2);

  ${(p) =>
    p.title
      ? ''
      : `
      border-top-left-radius: var(--border-radius-2);
    border-top-right-radius: var(--border-radius-2);
    `}
`;

const Line = styled('div')`
  display: table;
  border-collapse: collapse;
  padding: 0px 14px;
  border-left: 3px solid transparent;
  &.highlight-line {
    background: var(--maximeheckel-colors-emphasis);
    border-color: var(--maximeheckel-colors-brand);
  }

  &:hover {
    background-color: var(--maximeheckel-colors-emphasis);
  }
`;

const LineNo = styled('div')`
  width: 45px;
  padding: 0 12px;
  user-select: none;
  opacity: 1;
  color: var(--maximeheckel-colors-typeface-2);
`;

const LineContent = styled('span')`
  display: table-cell;
  width: 100%;
`;

const CodeSnippetTitle = styled('p')`
  font-size: 14px;
  margin-bottom: 0px;
  color: var(--maximeheckel-colors-typeface-2);
  font-weight: 500;
`;

const CodeSnippetHeader = styled('div')`
  @media (max-width: 500px) {
    border-radius: 0px;
    padding: 0px 8px;
  }

  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: var(--border-radius-2);
  border-top-right-radius: var(--border-radius-2);
  min-height: 50px;
  padding: 0px 14px;
  background-color: var(--maximeheckel-colors-foreground);
  border-bottom: 1px solid var(--maximeheckel-colors-emphasis);
`;

const CodeSnippetWrapper = styled('div')`
  @media (max-width: 750px) {
    /**
     * Make it fullbleed!
     */
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    border-radius: 0px;
  }
  border-radius: var(--border-radius-2);
  box-shadow: var(--maximeheckel-shadow-1);
  border: 1px solid var(--maximeheckel-colors-emphasis);
  margin-bottom: 32px;
`;
