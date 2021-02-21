import styled from '@emotion/styled';

import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { PrismTheme } from 'prism-react-renderer';
import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import * as Recharts from 'recharts';
import { useTheme } from '@theme/context/ThemeContext';
import Button from '@theme/components/Button';
import { fullWidthSnipperStyle, prismDark, prismLight } from './styles';
import { CodeBlockProps, CodeSnippetWrapperProps } from './types';

const LiveCodeBlock: React.FC<CodeBlockProps> = (props) => {
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

export default LiveCodeBlock;
