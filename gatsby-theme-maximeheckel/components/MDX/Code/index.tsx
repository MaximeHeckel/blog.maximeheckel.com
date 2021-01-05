import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import Highlight, {
  Prism,
  defaultProps,
  Language,
  PrismTheme,
} from 'prism-react-renderer';
import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import * as Recharts from 'recharts';
import Button, { CopyToClipboardButton } from '../../Button';
import { useTheme } from '../../../context/ThemeContext';

// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;

/**
 * This imports the syntax highlighting style for the Swift language
 */
require('prismjs/components/prism-swift');

type PrePropsType = {
  props: {
    live?: boolean;
    render?: boolean;
  };
  children: {
    props: {
      metastring: string;
      mdxType?: string;
      className?: string;
      children: string;
    };
  };
};

export const preToCodeBlock = (
  preProps: PrePropsType
):
  | {
      live?: boolean;
      render?: boolean;
      className: string;
      codeString: string;
      language: Language;
      metastring: string;
    }
  | undefined => {
  if (
    preProps.children &&
    preProps.children.props &&
    preProps.children.props.mdxType === 'code'
  ) {
    const {
      children: codeString,
      className = '',
      ...props
    } = preProps.children.props;

    const matches = className.match(/language-(?<lang>.*)/);
    return {
      className,
      codeString: codeString.trim(),
      language:
        matches && matches.groups && matches.groups.lang
          ? (matches.groups.lang as Language)
          : ('' as Language),
      ...props,
    };
  }
};

const RE = /{([\d,-]+)}/;

export const calculateLinesToHighlight = (metastring: string | null) => {
  if (!metastring || !RE.test(metastring)) {
    return () => false;
  } else {
    const lineNumbers = RE.exec(metastring)![1]
      .split(',')
      .map((v) => v.split('-').map((val) => parseInt(val, 10)));
    return (index: number) => {
      const lineNumber = index + 1;
      const inRange = lineNumbers.some(([start, end]) =>
        end ? lineNumber >= start && lineNumber <= end : lineNumber === start
      );
      return inRange;
    };
  }
};

const RETitle = /title=[A-Za-z](.+)/;

export const hasTitle = (metastring: string | null) => {
  if (!metastring || !RETitle.test(metastring)) {
    return '';
  } else {
    return RETitle.exec(metastring)![0].split('title=')[1];
  }
};

interface IInlineCodeProps {
  children: React.ReactNode;
}

export const InlineCode: React.FC<IInlineCodeProps> = (props) => {
  return <InlineCodeWrapper>{props.children}</InlineCodeWrapper>;
};

export const LiveCodeBlock: React.FC<ICodeBlockProps> = (props) => {
  const { codeString, live, render } = props;

  const { dark } = useTheme();
  const injectedStyled = require('@emotion/styled').default;

  const scope = {
    motion,
    useAnimation,
    useMotionValue,
    useTransform,
    styled: injectedStyled,
    Button,
    React,
    Recharts: { ...Recharts },
  };

  const baseTheme = dark ? prismDark : prismLight;

  const customTheme = {
    ...baseTheme,
    plain: {
      ...baseTheme.plain,
      fontFamily: 'Fira Code',
      fontSize: '14px',
      lineHeight: '26px',
      overflowWrap: 'normal',
      position: 'relative',
      overflow: 'auto',
    },
  } as PrismTheme;

  if (live) {
    return (
      <LiveProvider
        theme={customTheme}
        code={codeString}
        scope={scope}
        noInline={true}
      >
        <StyledLiveCodeWrapper fullWidth>
          <StyledPreviewWrapper height={600} withEditor={true}>
            <LivePreview />
            <StyledErrorWrapper>
              <LiveError />
            </StyledErrorWrapper>
          </StyledPreviewWrapper>
          <StyledEditorWrapper>
            <LiveEditor />
          </StyledEditorWrapper>
        </StyledLiveCodeWrapper>
      </LiveProvider>
    );
  }

  if (render) {
    return (
      <LiveProvider code={codeString} scope={scope} noInline={true}>
        <StyledLiveCodeWrapper>
          <StyledPreviewWrapper>
            <LivePreview />
          </StyledPreviewWrapper>
        </StyledLiveCodeWrapper>
      </LiveProvider>
    );
  }

  return null;
};

interface ICodeBlockProps {
  codeString: string;
  language: Language;
  metastring: string | null;
  live?: boolean;
  render?: boolean;
}

export const CodeBlock: React.FC<ICodeBlockProps> = (props) => {
  const { codeString, language, metastring } = props;

  const { dark } = useTheme();

  const baseTheme = dark ? prismDark : prismLight;

  const customTheme = {
    ...baseTheme,
    plain: {
      ...baseTheme.plain,
      fontFamily: 'Fira Code',
      fontSize: '14px',
    },
  } as PrismTheme;

  const shouldHighlightLine = calculateLinesToHighlight(metastring);
  const title = hasTitle(metastring);
  return (
    <CodeSnippetWrapper className="snippet">
      {title ? (
        <CodeSnippetHeader
          css={{
            backgroundColor: customTheme.plain.backgroundColor,
            borderBottom: `1px solid ${
              dark
                ? 'hsla(var(--palette-gray-90), 100%)'
                : 'hsla(var(--palette-gray-20), 100%)'
            }`,
          }}
        >
          <CodeSnippetTitle data-testid="codesnippet-title">
            {title}
          </CodeSnippetTitle>
          <CopyToClipboardButton text={codeString} />
        </CodeSnippetHeader>
      ) : null}
      <Highlight
        {...defaultProps}
        theme={customTheme}
        code={codeString}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <>
            <Pre title={title} className={className} style={style}>
              {tokens.map((line, index) => {
                const { className: lineClassName } = getLineProps({
                  className: shouldHighlightLine(index) ? 'highlight-line' : '',
                  key: index,
                  line,
                });

                return (
                  <Line
                    data-testid={
                      shouldHighlightLine(index) ? 'highlight-line' : 'line'
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
    </CodeSnippetWrapper>
  );
};

export const Code: React.FC<PrePropsType> = (preProps) => {
  const props = preToCodeBlock(preProps);

  if (props) {
    return props.live || props.render ? (
      <LiveCodeBlock {...props} />
    ) : (
      <CodeBlock {...props} />
    );
  } else {
    return <pre {...preProps} />;
  }
};

const Pre = styled.pre<{ title?: string }>`
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

const Line = styled.div`
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

const LineNo = styled.div`
  width: 45px;
  padding: 0 12px;
  user-select: none;
  opacity: 0.5;
`;

const LineContent = styled.span`
  display: table-cell;
  width: 100%;
`;

const InlineCodeWrapper = styled('code')`
  border-radius: var(--border-radius-1);
  background-color: var(--maximeheckel-colors-emphasis);
  color: var(--maximeheckel-colors-brand);
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 6px;
  padding-right: 6px;
  font-size: 16px;
  font-weight: 400 !important;
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
  min-height: 45px;
  padding: 0px 14px;
`;

const fullWidthSnipperStyle = () => css`
  position: relative;
  width: 100vw;
  left: calc(-50vw + 50%);
  border-radius: 0px;
  max-width: 1100px;
`;

const CodeSnippetWrapper = styled('div')`
  @media (max-width: 600px) {
    ${fullWidthSnipperStyle}
  }
  width: 100%;
  border-radius: var(--border-radius-2);
  margin: 40px 0px;
  position: relative;
`;

interface CodeSnippetWrapperProps {
  fullWidth?: boolean;
}

const StyledLiveCodeWrapper = styled('div')<CodeSnippetWrapperProps>`
  @media (max-width: 750px) {
    display: block;
  }

  @media (max-width: 1100px) {
    ${(p) => (p.fullWidth ? fullWidthSnipperStyle : '')}
  }

  @media (min-width: 1101px) {
    ${(p) =>
      p.fullWidth
        ? `
        width: 1100px;
        transform: translateX(-200px);
`
        : ''}
  }

  backdrop-filter: blur(6px);
  border-radius: var(--border-radius-2);
  display: flex;
  align-items: center;
  margin: 40px 0px;
`;

const StyledEditorWrapper = styled('div')`
  flex: 60 1 0%;
  height: 100%;
  max-height: 600px;
  overflow: auto;
  margin: 0;
  border-top-right-radius: var(--border-radius-2);
  border-bottom-right-radius: var(--border-radius-2);

  * > textarea:focus {
    outline: none;
  }
`;

const StyledPreviewWrapper = styled('div')<{
  height?: number;
  withEditor?: boolean;
}>`
  max-height: 600px;
  min-height: ${(p) => p.height || 300}px;
  flex: 40 1 0%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--maximeheckel-colors-emphasis);
  ${(p) =>
    p.withEditor
      ? `
  border-top-left-radius: var(--border-radius-2);
  border-bottom-left-radius: var(--border-radius-2);
  `
      : `
  border-radius: var(--border-radius-2);
  `}
`;

const StyledErrorWrapper = styled('div')`
  color: var(--maximeheckel-colors-typeface-1);

  pre {
    padding: 15px;
    margin-bottom: 0px;
  }
`;

const prismLight = {
  plain: {
    color: '#403f53',
    backgroundColor: 'var(--maximeheckel-colors-foreground)',
  },
  styles: [
    {
      types: ['changed'],
      style: {
        color: 'rgb(162, 191, 252)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['deleted'],
      style: {
        color: 'rgba(239, 83, 80, 0.56)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['inserted', 'attr-name'],
      style: {
        color: 'rgb(72, 118, 214)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['comment'],
      style: {
        color: 'rgb(152, 159, 177)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['string', 'builtin', 'char', 'constant', 'url'],
      style: {
        color: 'rgb(72, 118, 214)',
      },
    },
    {
      types: ['variable'],
      style: {
        color: 'rgb(201, 103, 101)',
      },
    },
    {
      types: ['number'],
      style: {
        color: 'rgb(170, 9, 130)',
      },
    },
    {
      // This was manually added after the auto-generation
      // so that punctuations are not italicised
      types: ['punctuation'],
      style: {
        color: 'rgb(153, 76, 195)',
      },
    },
    {
      types: ['function', 'selector', 'doctype'],
      style: {
        color: 'rgb(153, 76, 195)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['class-name'],
      style: {
        color: 'rgb(17, 17, 17)',
      },
    },
    {
      types: ['tag'],
      style: {
        color: 'rgb(153, 76, 195)',
      },
    },
    {
      types: ['operator', 'property', 'keyword', 'namespace'],
      style: {
        color: 'rgb(12, 150, 155)',
      },
    },
    {
      types: ['boolean'],
      style: {
        color: 'rgb(188, 84, 84)',
      },
    },
  ],
};

const prismDark = {
  plain: {
    color: '#d6deeb',
    backgroundColor: 'var(--maximeheckel-colors-foreground)',
  },
  styles: [
    {
      types: ['changed'],
      style: {
        color: 'rgb(162, 191, 252)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['deleted'],
      style: {
        color: 'rgba(239, 83, 80, 0.56)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['inserted', 'attr-name'],
      style: {
        color: 'rgb(173, 219, 103)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['comment'],
      style: {
        color: 'rgb(99, 119, 119)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['string', 'url'],
      style: {
        color: 'rgb(173, 219, 103)',
      },
    },
    {
      types: ['variable'],
      style: {
        color: 'rgb(214, 222, 235)',
      },
    },
    {
      types: ['number'],
      style: {
        color: 'rgb(247, 140, 108)',
      },
    },
    {
      types: ['builtin', 'char', 'constant', 'function'],
      style: {
        color: 'rgb(130, 170, 255)',
      },
    },
    {
      // This was manually added after the auto-generation
      // so that punctuations are not italicised
      types: ['punctuation'],
      style: {
        color: 'rgb(199, 146, 234)',
      },
    },
    {
      types: ['selector', 'doctype'],
      style: {
        color: 'rgb(199, 146, 234)',
        fontStyle: 'italic',
      },
    },
    {
      types: ['class-name'],
      style: {
        color: 'rgb(255, 203, 139)',
      },
    },
    {
      types: ['tag', 'operator', 'keyword'],
      style: {
        color: 'rgb(127, 219, 202)',
      },
    },
    {
      types: ['boolean'],
      style: {
        color: 'rgb(255, 88, 116)',
      },
    },
    {
      types: ['property'],
      style: {
        color: 'rgb(128, 203, 196)',
      },
    },
    {
      types: ['namespace'],
      style: {
        color: 'rgb(178, 204, 214)',
      },
    },
  ],
};
