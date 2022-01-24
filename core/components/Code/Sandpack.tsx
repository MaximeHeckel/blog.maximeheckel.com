import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
} from '@codesandbox/sandpack-react';
import '@codesandbox/sandpack-react/dist/index.css';
import { styled } from 'lib/stitches.config';
import setupFiles from './SandpackSetupFiles';
// import setupFiles from './SandpackSetupFiles';

// Default Theme
const theme = {
  palette: {
    activeText: 'var(--maximeheckel-colors-brand)',
    defaultText: 'var(--maximeheckel-colors-typeface-secondary)',
    inactiveText: 'unset',
    // inactiveText: 'var(--maximeheckel-border-color)',
    activeBackground: 'var(--maximeheckel-colors-emphasis)',
    // defaultBackground: 'var(--maximeheckel-card-background-color)',
    defaultBackground: 'unset',
    accent: 'var(--maximeheckel-colors-brand)',
    errorBackground: 'var(--maximeheckel-colors-body)',
    errorForeground: 'var(--maximeheckel-colors-danger)',
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
  typography: {
    bodyFont: 'var(--font-display)',
    monoFont: 'var(--font-mono)',
    fontSize: '14px',
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
const SandpackWrapper = styled('div', {
  '.sp-layout': {
    position: 'relative',
    marginBottom: '32px',
    borderRadius: 'var(--border-radius-2)',

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
  },

  '.sp-navigator,.sp-tabs-scrollable-container': {
    background: 'var(--maximeheckel-card-background-color)',
  },

  '.sp-preview-container': {
    background: 'var(--maximeheckel-colors-foreground)',
    backdropFilter: 'blur(6px)',
  },

  '.sp-cm': {
    padding: '2px 0',
  },

  '.sp-button': {
    backgroundColor: 'var(--maximeheckel-colors-body)!important',
    cursor: 'pointer !important',
    '&:hover': {
      backgroundColor: 'var(--maximeheckel-colors-body)!important',
    },
  },

  '.sp-icon,.sp-icon-standalone': {
    color: 'var(--maximeheckel-colors-typeface-secondary) !important',

    svg: {
      fill: 'currentColor',
    },
  },

  '.cm-gutters': {
    background: 'var(--maximeheckel-card-background-color)',
  },

  '.cm-scroller': {
    background: 'var(--maximeheckel-card-background-color)',
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
  editorOnly?: boolean;
  renderOnly?: boolean; // TODO Make sure you can't have autorun = true and renderOnly = true
}

const Sandpack = (props: SandpackProps) => {
  const {
    files,
    dependencies,
    template,
    autorun = true,
    editorOnly = false,
    renderOnly = false,
  } = props;
  const editorPart = props.options?.editorWidthPercentage || 50;
  const previewPart = 100 - editorPart;

  const defaultFilesByTemplate: Record<SandpackPredefinedTemplate, any> = {
    react: setupFiles,
    // TODO
    'react-ts': '',
    vanilla: '',
    'vanilla-ts': '',
    angular: '',
    vue: '',
    vue3: '',
    svelte: '',
  };

  return (
    <SandpackWrapper>
      <SandpackProvider
        template={template}
        customSetup={{
          files: {
            ...files,
            ...defaultFilesByTemplate[template],
          },
          dependencies: dependencies || {},
        }}
        autorun={autorun}
      >
        <SandpackLayout theme={theme}>
          {!editorOnly ? (
            <SandpackPreview
              showNavigator={defaultEditorOptions.showNavigator}
              customStyle={{
                height: defaultEditorOptions.editorHeight,
                flexGrow: previewPart,
                flexShrink: previewPart,
                minWidth: 700 * (previewPart / (previewPart + editorPart)),
              }}
            />
          ) : null}
          {!renderOnly ? (
            <SandpackCodeEditor
              {...defaultEditorOptions}
              customStyle={{
                height: defaultEditorOptions.editorHeight,
                flexGrow: editorPart,
                flexShrink: editorPart,
                minWidth: 700 * (editorPart / (previewPart + editorPart)),
              }}
            />
          ) : null}
        </SandpackLayout>
      </SandpackProvider>
    </SandpackWrapper>
  );
};

export default Sandpack;
