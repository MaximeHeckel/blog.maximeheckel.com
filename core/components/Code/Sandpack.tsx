import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackConsole,
  SandpackFiles,
} from '@codesandbox/sandpack-react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

import Flex from '@core/components/Flex';
import { useIsMobile } from '@core/hooks/useIsMobile';

import { SandpackWrapper } from './Sandpack.styles';
import setupFiles from './SandpackSetupFiles';
import { CustomRunButton } from './components/CustomSandpackButtons';
import PreviewTabs, { Tab } from './components/PreviewTabs';

// Default Theme
const theme = {
  colors: {
    base: 'var(--token-text)',
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
    plain: 'var(--token-text)',
    comment: {
      color: 'var(--token-comment)',
    },
    keyword: 'var(--token-keyword)',
    tag: 'var(--token-keyword)',
    punctuation: 'var(--token-punctuation)',
    definition: 'var(--token-function)',
    property: 'var(--token-text)',
    static: 'var(--token-number)',
    string: 'var(--token-string)',
  },
  font: {
    body: 'var(--font-display)',
    mono: 'var(--font-mono-code)',
    size: '14px',
    lineHeight: '26px',
  },
};

// TODO extends from sandpack type
interface SandpackOptions {
  editorWidthPercentage: number;
  editorHeight: number;
}

interface SandpackProps {
  template: SandpackPredefinedTemplate;
  options?: SandpackOptions;
  files: SandpackFiles;
  dependencies?: Record<string, string>;
  autorun?: boolean;
  defaultTab?: Tab;
  showCode?: boolean;
}

const defaultFilesByTemplate: Partial<
  Record<SandpackPredefinedTemplate, SandpackFiles | undefined>
> = {
  react: setupFiles,
  'react-ts': undefined,
  vanilla: undefined,
  'vanilla-ts': undefined,
  angular: undefined,
  vue: undefined,
  'vue-ts': undefined,
  svelte: undefined,
  solid: undefined,
  'test-ts': undefined,
};

const Sandpack = (props: SandpackProps) => {
  const {
    files,
    dependencies,
    template,
    autorun = true,
    defaultTab = 'preview',
    showCode = true,
  } = props;

  const isMobile = useIsMobile();

  const [consoleKey, setConsoleKey] = useState(0);
  const [selectedTab, setSelectedTab] = useState<Tab>(defaultTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Start from the requested default to match SSR, then account for mobile.
  const [displayCode, setDisplayCode] = useState(showCode);
  const [shouldAutorun, setShouldAutorun] = useState(autorun);

  // Sync with isMobile state after hydration to avoid SSR mismatch
  useEffect(() => {
    if (isMobile) {
      setDisplayCode(false);
      setShouldAutorun(false);
    }
  }, [isMobile]);

  const defaultEditorOptions = {
    editorHeight: 620,
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
          autorun: shouldAutorun,
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
                zIndex: 4,
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
                  : defaultEditorOptions.editorHeight - 48,
                display: selectedTab === 'console' ? 'flex' : 'none',
              }}
            />
            <SandpackPreview
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              style={{
                height: isFullscreen
                  ? '100dvh'
                  : defaultEditorOptions.editorHeight - 48,
                display: selectedTab === 'preview' ? 'flex' : 'none',
              }}
            >
              <CustomRunButton />
            </SandpackPreview>
          </Flex>
        </SandpackLayout>
      </SandpackProvider>
    </SandpackWrapper>
  );
};

export default Sandpack;
