import Pill from '@theme/components/Pill';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
  LayoutGroup,
} from 'framer-motion';
import { styled } from 'lib/stitches.config';
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

// `
//   position: relative;

//   backdrop-filter: blur(6px);
//   border-radius: var(--border-radius-2);
//   display: flex;
//   align-items: center;
//   margin-bottom: 32px;

//   @media (max-width: 750px) {
//     display: block;
//   }

//   @media (max-width: 1100px) {
//     /**
//      * Make it fullbleed!
//      */
//     width: 100vw;

//     left: 50%;
//     right: 50%;
//     margin-left: -50vw;
//     margin-right: -50vw;
//   }

//   @media (min-width: 1100px) {
//     position: relative;
//     width: calc(100% + 400px);
//     margin-left: -200px;
//     margin-right: -200px;
//   }
// `;

const StyledEditorWrapper = styled('div', {
  flex: '50 1 0%',
  height: '100%',
  maxHeight: '600px',
  overflow: 'auto',
  margin: '0',

  '* > textarea:focus': {
    outline: 'none',
  },
});

/*`
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
`; */

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

// `
//   max-height: 600px;
//   min-height: ${(p) => p.height || 300}px;
//   flex: 40 1 0%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background-color: var(--maximeheckel-colors-emphasis);
//   overflow: hidden;
//   ${(p) =>
//     p.withEditor
//       ? `
//     border-top-left-radius: var(--border-radius-2);
//     border-bottom-left-radius: var(--border-radius-2);
//     `
//       : `
//     border-radius: var(--border-radius-2);
//     `}
// `;

const StyledErrorWrapper = styled('div', {
  color: 'var(--maximeheckel-colors-typeface-secondary)',
  maxWidth: '300px',

  pre: {
    padding: '15px',
    marginBottom: '0px',
  },
});

// `
//   color: var(--maximeheckel-colors-typeface-secondary);
//   max-width: 300px;

//   pre {
//     padding: 15px;
//     margin-bottom: 0px;
//   }
// `;

export default LiveCodeBlock;
