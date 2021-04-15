import styled from '@emotion/styled';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
  AnimateSharedLayout,
} from 'framer-motion';
import { PrismTheme } from 'prism-react-renderer';
import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import Button from '@theme/components/Button';
import { LinkButton } from '@theme/components/Button/LinkButton';
import Pill from '@theme/components/Pill';
import { CodeBlockProps, CodeSnippetWrapperProps } from './types';

const LiveCodeBlock = (props: CodeBlockProps) => {
  const { codeString, live, render } = props;
  const injectedStyled = require('@emotion/styled').default;

  const scope = {
    motion,
    AnimatePresence,
    AnimateSharedLayout,
    useAnimation,
    useMotionValue,
    useTransform,
    styled: injectedStyled,
    Button,
    LinkButton,
    Pill,
    React,
  };

  const customTheme = {
    styles: [],
    plain: {},
  } as PrismTheme;

  if (live) {
    return (
      <LiveProvider
        theme={customTheme}
        code={codeString}
        scope={scope}
        noInline={true}
      >
        <StyledLiveCodeWrapper>
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
  position: relative;

  @media (max-width: 750px) {
    display: block;
  }

  @media (max-width: 1100px) {
    /**
     * Make it fullbleed! 
     */
    width: 100vw;

    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
  }

  @media (min-width: 1100px) {
    position: relative;
    width: calc(100% + 400px);
    margin: 0px -200px 32px -200px;
  }

  backdrop-filter: blur(6px);
  border-radius: var(--border-radius-2);
  display: flex;
  align-items: center;
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
  overflow: hidden;
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
  max-width: 300px;

  pre {
    padding: 15px;
    margin-bottom: 0px;
  }
`;

export default LiveCodeBlock;
