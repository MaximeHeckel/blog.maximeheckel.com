import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import { Box, Flex, Shadows, styled } from '@maximeheckel/design-system';
import React from 'react';
import PreviewTabs, { Tab } from './components/PreviewTabs';
import setupFiles from './SandpackSetupFiles';

// Default Theme
const theme = {
  colors: {
    hover: 'var(--maximeheckel-colors-brand)',
    clickable: 'var(--maximeheckel-colors-typeface-secondary)',
    accent: 'var(--maximeheckel-colors-brand)',
    errorSurface: 'var(--maximeheckel-colors-danger-emphasis)',
    error: 'var(--maximeheckel-colors-danger)',
    surface3: 'var(--maximeheckel-colors-emphasis)',
    surface2: 'var(--maximeheckel-border-color)',
    surface1: 'var(--maximeheckel-card-background-color)',
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
    mono: 'var(--font-mono)',
    size: '14px',
    lineHeight: '26px',
  },
};

const defaultEditorOptions = {
  showNavigator: false,
  showInlineErrors: true,
  showLineNumbers: true,
  editorHeight: 520,
};

// Styles
const SandpackWrapper = styled(Box, {
  '.sp-layout': {
    background: 'var(--maximeheckel-card-background-color)',
    position: 'relative',
    borderRadius: 'var(--border-radius-2)',
    boxShadow: Shadows[1],
    '@media (max-width: 770px)': {
      display: 'block',
    },
    '@media (max-width: 1200px)': {
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
  },
  '.cm-gutterElement': {
    fontSize: '12px',
    userSelect: 'none',
    opacity: '1',
    color: 'var(--maximeheckel-colors-typeface-tertiary)',
  },

  // Hide default console clear button
  '.sp-console': {
    '> button': {
      display: 'none',
    },
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

const defaultFilesByTemplate: Record<SandpackPredefinedTemplate, any> = {
  react: setupFiles,
  // TODO
  'react-ts': '',
  vanilla: '',
  'vanilla-ts': '',
  angular: '',
  vue: '',
  vue3: '',
  'vue3-ts': '',
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

  const [consoleKey, setConsoleKey] = React.useState(0);
  const [selectedTab, setSelectedTab] = React.useState<Tab>(defaultTab);

  return (
    <SandpackWrapper>
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
          autorun,
        }}
      >
        <SandpackLayout>
          <Flex
            direction="column"
            justifyContent="space-between"
            css={{
              height: defaultEditorOptions.editorHeight,
              gap: 0,
              width: '50%',
              '@media (max-width: 880px)': {
                width: '100%',
              },
            }}
          >
            <PreviewTabs
              onClear={() => setConsoleKey(consoleKey + 1)}
              onTabSelect={(tab) => setSelectedTab(tab)}
              selectedTab={selectedTab}
            />
            <SandpackConsole
              key={consoleKey}
              showHeader
              style={{
                height: defaultEditorOptions.editorHeight - 40,
                display: selectedTab === 'console' ? 'flex' : 'none',
              }}
            />
            <SandpackPreview
              showNavigator={defaultEditorOptions.showNavigator}
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              style={{
                height: defaultEditorOptions.editorHeight - 40,
                display: selectedTab === 'preview' ? 'flex' : 'none',
              }}
            />
          </Flex>
          <SandpackCodeEditor
            {...defaultEditorOptions}
            showRunButton={false}
            style={{
              borderLeft: '1px solid var(--maximeheckel-border-color)',
              height: defaultEditorOptions.editorHeight,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </SandpackWrapper>
  );
};

export default Sandpack;
