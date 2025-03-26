import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import { Box, Flex, Shadows, styled } from '@maximeheckel/design-system';
import { useState } from 'react';

import { useIsMobile } from '@core/hooks/useIsMobile';

import setupFiles from './SandpackSetupFiles';
import PreviewTabs, { Tab } from './components/PreviewTabs';

// Default Theme
const theme = {
  colors: {
    hover: 'var(--accent)',
    clickable: 'var(--text-secondary)',
    accent: 'var(--accent)',
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
    background: 'var(--card-background)',
    position: 'relative',
    borderRadius: 'var(--border-radius-2)',
    boxShadow: Shadows[1],
  },
  '.cm-gutterElement': {
    fontSize: '12px',
    userSelect: 'none',
    opacity: '1',
    color: 'var(--text-tertiary)',
  },

  // Hide default console clear button
  '.sp-console': {
    '> button': {
      display: 'none',
    },
  },

  '.sp-tab-container': {
    paddingRight: 'var(--space-1)',
    outline: 'none !important',
  },

  variants: {
    fullscreen: {
      true: {
        '.sp-layout': {
          width: '100%',
          height: '100%',
          borderRadius: '0px',
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
          margin: 'var(--space-5) 0px',
          '@media (max-width: 880px)': {
            display: 'block',
            width: '95vw',
            left: '50%',
            right: '50%',
            marginLeft: '-47.5vw',
            marginRight: '-47.5vw',
          },

          '@media (min-width: 880px)': {
            position: 'relative',
            width: 'calc(100% + 150px)',
            marginLeft: '-75px',
            marginRight: '-75px',
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

  const defaultEditorOptions = {
    showNavigator: false,
    showInlineErrors: true,
    showLineNumbers: true,
    editorHeight: 520,
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
          <Flex
            direction="column"
            justifyContent="space-between"
            css={{
              gap: 0,
              width: '50%',
              '@media (max-width: 880px)': {
                width: '100%',
              },
            }}
            style={{
              height: isFullscreen ? '100dvh' : '520px',
            }}
          >
            <PreviewTabs
              onFullscreen={handleFullscreen}
              onClear={() => setConsoleKey(consoleKey + 1)}
              onTabSelect={(tab) => setSelectedTab(tab)}
              selectedTab={selectedTab}
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
          <SandpackCodeEditor
            {...defaultEditorOptions}
            showRunButton={false}
            style={{
              borderLeft: '1px solid var(--border-color)',
              height: isFullscreen
                ? '100dvh'
                : defaultEditorOptions.editorHeight,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </SandpackWrapper>
  );
};

export default Sandpack;
