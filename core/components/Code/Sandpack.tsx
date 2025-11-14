import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import { Box, Flex, Shadows, styled } from '@maximeheckel/design-system';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { useIsMobile } from '@core/hooks/useIsMobile';

import setupFiles from './SandpackSetupFiles';
import { CustomRunButton } from './components/CustomSandpackButtons';
import PreviewTabs, { Tab } from './components/PreviewTabs';

// Default Theme
const theme = {
  colors: {
    hover: 'var(--text-secondary)',
    clickable: 'var(--text-tertiary)',
    accent: 'var(--text-primary)',
    errorSurface: 'var(--danger-emphasis)',
    error: 'var(--danger)',
    surface3: 'var(--emphasis)',
    surface2: 'var(--border-color)',
    surface1: 'var(--card-background)',
  },
  syntax: {
    plain: 'var(--token-comment)',
    comment: {
      color: 'var(--token-comment)',
    },
    keyword: 'var(--token-keyword)',
    tag: 'var(--token-symbol)',
    punctuation: 'var(--token-punctuation)',
    definition: 'var(--token-function)',
    property: 'var(--token-function)',
    static: 'var(--token-comment)',
    string: 'var(--token-selector)',
  },
  font: {
    body: 'var(--font-display)',
    mono: 'var(--font-mono-code)',
    size: '14px',
    lineHeight: '26px',
  },
};

// Styles
const SandpackWrapper = styled(Box, {
  '.sp-layout': {
    background: 'transparent',
    position: 'relative',
    border: 'none',
    boxShadow: Shadows[1],
  },

  '.cm-scroller': {
    padding: 'var(--space-2) 0px !important',
  },

  '.cm-gutter': {
    padding: ' 0px var(--space-2) !important',
  },

  '.cm-gutterElement': {
    fontSize: '12px',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'var(--font-mono-code)',
    userSelect: 'none',
    opacity: '1',
    color: 'var(--text-tertiary)',
  },

  '.cm-content': {
    padding: '0px',
  },

  // Hide default console clear button
  '.sp-console-actions': {
    display: 'none',
  },

  '.sp-tabs-scrollable-container': {
    padding: '0 4px',
  },

  '.sp-tabs': {
    background: 'var(--background)',
    border: 'none !important',
    borderBottom: '1px solid var(--border-color) !important',
    position: 'relative',
  },

  '.sp-tab-container': {
    paddingRight: 'var(--space-1)',
    outline: 'none !important',
    position: 'relative',
    display: 'block',
    padding: '0 var(--space-2)',
    minWidth: 80,
    width: 'auto',
    flex: '0 0 auto',
    whiteSpace: 'nowrap',

    '--tab-border-color': 'transparent',
    borderTopLeftRadius: 'var(--border-radius-1)',
    borderTopRightRadius: 'var(--border-radius-1)',
    borderTop: '1px solid var(--tab-border-color)',
    borderLeft: '1px solid var(--tab-border-color)',
    borderRight: '1px solid var(--tab-border-color)',
    marginTop: 4,
    marginBottom: 0,

    '& button': {
      margin: '0 auto',
    },

    '&[aria-selected="true"]': {
      '--tab-border-color': 'var(--border-color)',
      background: 'var(--card-background)',
      borderBottom: '2px solid var(--card-background)',
      marginBottom: 0,
      color: 'var(--text-primary) !important',

      '&:before': {
        content: '""',
        position: 'absolute',
        bottom: -2,
        left: -9,
        width: 9,
        height: 9,
        background:
          'radial-gradient(circle at top left, transparent 8px, var(--border-color) 8px, var(--border-color) 9px, transparent 9px), ' +
          'radial-gradient(circle at top left, transparent 7px, var(--card-background) 7px)',
      },

      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: -2,
        right: -9,
        width: 9,
        height: 9,
        background:
          'radial-gradient(circle at top right, transparent 8px, var(--border-color) 8px, var(--border-color) 9px, transparent 9px), ' +
          'radial-gradient(circle at top right, transparent 7px, var(--card-background) 7px)',
      },
    },
  },

  '.sp-editor': {
    '@media (max-width: 960px)': {
      flex: 'unset !important',
    },
  },

  '.sp-preview-container': {
    background: 'var(--card-background)',
  },

  variants: {
    fullscreen: {
      true: {
        '.sp-layout': {
          width: '100%',
          height: '100%',
          margin: '0px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,

          '& iframe': {
            height: '100dvh !important',
          },
        },
      },
      false: {
        '.sp-layout': {
          display: 'flex',
          margin: 'var(--space-5) 0px',
          gap: 'var(--space-4)',
          flexDirection: 'row',
          '@media (max-width: 960px)': {
            display: 'flex',
            flexDirection: 'column',
            width: '95vw',
            left: '50%',
            right: '50%',
            marginLeft: '-47.5vw',
            marginRight: '-47.5vw',
          },

          '@media (min-width: 960px)': {
            position: 'relative',
            width: 'calc(100% + 250px)',
            marginLeft: '-125px',
            marginRight: '-125px',
          },
        },
      },
    },
  },

  defaultVariants: {
    fullscreen: false,
  },
});

// TODO extends from sandpack type
interface SandpackOptions {
  editorWidthPercentage: number;
  editorHeight: number;
}

interface SandpackProps {
  template: SandpackPredefinedTemplate;
  options?: SandpackOptions;
  // Type using Sandpack built in types
  files: Record<string, any>;
  dependencies?: Record<string, string>;
  autorun?: boolean;
  defaultTab?: Tab;
}

const defaultFilesByTemplate: Partial<Record<SandpackPredefinedTemplate, any>> =
  {
    react: setupFiles,
    // TODO
    'react-ts': '',
    vanilla: '',
    'vanilla-ts': '',
    angular: '',
    vue: '',
    'vue-ts': '',
    svelte: '',
    solid: '',
    'test-ts': '',
  };

const Sandpack = (props: SandpackProps) => {
  const {
    files,
    dependencies,
    template,
    autorun = true,
    defaultTab = 'preview',
  } = props;

  const isMobile = useIsMobile();

  const [consoleKey, setConsoleKey] = useState(0);
  const [selectedTab, setSelectedTab] = useState<Tab>(defaultTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayCode, setDisplayCode] = useState(false);

  const defaultEditorOptions = {
    editorHeight: isMobile ? 520 : 620,
  };

  const handleToggleCode = () => {
    setDisplayCode((prev) => !prev);
  };

  const handleFullscreen = () => {
    setIsFullscreen((prev) => {
      document.body.style.overflow = prev ? 'auto' : 'hidden';
      return !prev;
    });
  };

  return (
    <SandpackWrapper fullscreen={isFullscreen}>
      <SandpackProvider
        template={template}
        theme={theme}
        files={{
          ...files,
          ...defaultFilesByTemplate[template],
        }}
        customSetup={{
          dependencies: dependencies || {},
        }}
        options={{
          autorun: isMobile ? false : autorun,
        }}
      >
        <SandpackLayout>
          <AnimatePresence mode="popLayout">
            {displayCode ? (
              <SandpackCodeEditor
                showRunButton={false}
                showTabs
                showLineNumbers
                style={{
                  borderLeft: '1px solid var(--border-color)',
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  borderRight: isFullscreen
                    ? 'none'
                    : '1px solid var(--border-color)',
                  borderRadius: isFullscreen ? '0px' : 'var(--border-radius-2)',
                  height: isFullscreen
                    ? '100dvh'
                    : defaultEditorOptions.editorHeight,
                }}
              />
            ) : null}
          </AnimatePresence>
          <Flex
            direction="column"
            justifyContent="space-between"
            css={{
              gap: 0,
              flex: 1,
              position: 'relative',
              background: 'var(--card-background)',
              borderRadius: isFullscreen ? '0px' : 'var(--border-radius-2)',
              overflow: 'hidden',
              '@media (max-width: 960px)': {
                width: '100%',
              },
              '&:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: isFullscreen ? '0px' : 'var(--border-radius-2)',
              },
            }}
            style={{
              height: isFullscreen
                ? '100dvh'
                : defaultEditorOptions.editorHeight,
            }}
          >
            <Flex
              css={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              <CustomRunButton />
            </Flex>
            <PreviewTabs
              onFullscreen={handleFullscreen}
              onClear={() => setConsoleKey(consoleKey + 1)}
              onTabSelect={(tab) => setSelectedTab(tab)}
              selectedTab={selectedTab}
              onToggleCode={handleToggleCode}
            />

            <SandpackConsole
              key={consoleKey}
              showHeader
              style={{
                height: isFullscreen
                  ? '100dvh'
                  : defaultEditorOptions.editorHeight - 40,
                display: selectedTab === 'console' ? 'flex' : 'none',
              }}
            />
            <SandpackPreview
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              style={{
                height: isFullscreen
                  ? '100dvh'
                  : defaultEditorOptions.editorHeight - 40,
                display: selectedTab === 'preview' ? 'flex' : 'none',
              }}
            />
          </Flex>
        </SandpackLayout>
      </SandpackProvider>
    </SandpackWrapper>
  );
};

export default Sandpack;
