import Pill from '@theme/components/Pill';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
  LayoutGroup,
} from 'framer-motion';
import { styled } from '@maximeheckel/design-system';
import { PrismTheme } from 'prism-react-renderer';
import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { CodeBlockProps } from './types';

const LiveCodeBlock = (props: CodeBlockProps) => {
  const { codeString, live, render } = props;

  const scope = {
    motion,
    AnimatePresence,
    LayoutGroup,
    useAnimation,
    useMotionValue,
    useTransform,
    styled,
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
          <StyledPreviewWrapper withEditor>
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

const StyledLiveCodeWrapper = styled('div', {
  position: 'relative',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '32px',
  borderRadius: 'var(--border-radius-2)',
  overflow: 'hidden',

  '@media (max-width: 750px)': {
    display: 'block',
  },

  '@media (max-width: 1200px)': {
    /**
     * Make it fullbleed!
     */
    width: '100vw',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    borderRadius: '0px',
  },

  '@media (min-width: 1200px)': {
    position: 'relative',
    width: 'calc(100% + 200px)',
    marginLeft: '-100px',
    marginRight: '-100px',
  },
});

const StyledEditorWrapper = styled('div', {
  flex: '50 1 0%',
  height: '100%',
  maxHeight: '600px',
  overflow: 'auto',
  margin: '0',

  'textarea:focus': {
    outline: 'none',
  },

  'pre, textarea': {
    backgroundColor: 'var(--code-snippet-background) !important',
    fontFamily: 'var(--font-mono) !important',
    fontSize: 'var(--font-size-1) !important',
    lineHeight: '26px !important',
  },
});

const StyledPreviewWrapper = styled('div', {
  maxHeight: '600px',
  flex: '50 1 0%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--maximeheckel-colors-emphasis)',
  overflow: 'hidden',

  '@media (max-width: 750px)': {
    borderRadius: '0px !important',
  },

  variants: {
    withEditor: {
      true: {
        minHeight: '600px',
      },
      false: {
        minHeight: '300px',
      },
    },
  },
});

const StyledErrorWrapper = styled('div', {
  color: 'var(--maximeheckel-colors-typeface-secondary)',
  maxWidth: '300px',

  pre: {
    padding: '15px',
    marginBottom: '0px',
  },
});

export default LiveCodeBlock;
