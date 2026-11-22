import { Shadows } from 'lib/tokens/shadows';
import { styled } from 'styled-system/jsx';

import Box from '@core/components/Box';

import { syntaxTheme } from './syntaxTheme';

export const SandpackWrapper = styled(Box, {
  base: {
    ...syntaxTheme,
    '& .sp-layout': {
      background: 'transparent !important',
      border: 'none !important',
      boxShadow: Shadows[1],
      gap: 0,
    },

    '& .cm-scroller': {
      padding: 'var(--space-2) 0px !important',
      // Match the site theme while preserving native scrollbar visibility.
      scrollbarColor: 'var(--scrollbar-thumb) transparent',
      scrollbarWidth: 'thin',
    },

    '& .cm-gutter': {
      padding: ' 0px var(--space-2) !important',
    },

    '& .cm-gutterElement': {
      fontSize: '12px',
      fontVariantNumeric: 'tabular-nums',
      fontFamily: 'var(--font-mono-code)',
      userSelect: 'none',
      opacity: '1',
      color: 'var(--text-tertiary)',
    },

    '& .cm-content': {
      padding: '0px',
    },

    // Sandpack injects unlayered CSS for its layout and tabs.
    '& .sp-console-actions': {
      display: 'none !important',
    },

    '& .sp-tabs-scrollable-container': {
      padding: '0 4px',
      scrollbarColor: 'var(--scrollbar-thumb) transparent',
      scrollbarWidth: 'thin',
    },

    '& .sp-tabs': {
      background: 'var(--background) !important',
      border: 'none !important',
      borderBottom: '1px solid var(--border-color) !important',
      position: 'relative',
    },

    '& .sp-tab-container': {
      outline: 'none !important',
      position: 'relative',
      display: 'block !important',
      padding: '0 var(--space-2) !important',
      minWidth: '80px',
      width: 'auto',
      flex: '0 0 auto',
      whiteSpace: 'nowrap',

      '--tab-border-color': 'transparent',
      borderTopLeftRadius: 'var(--border-radius-1)',
      borderTopRightRadius: 'var(--border-radius-1)',
      borderTop: '1px solid var(--tab-border-color)',
      borderLeft: '1px solid var(--tab-border-color)',
      borderRight: '1px solid var(--tab-border-color)',
      marginTop: '4px !important',
      marginBottom: '0px !important',

      '& button': {
        margin: '0 auto !important',
        minWidth: '0 !important',
        minHeight: '0 !important',
      },

      '&[aria-selected="true"]': {
        '--tab-border-color': 'var(--border-color)',
        background: 'var(--card-background) !important',
        borderBottom: '2px solid var(--card-background)',
        marginBottom: '0px !important',
        color: 'var(--text-primary) !important',

        '&:before': {
          content: '""',
          position: 'absolute',
          bottom: '-2px',
          left: '-9px',
          width: '9px',
          height: '9px',
          background:
            'radial-gradient(circle at top left, transparent 8px, var(--border-color) 8px, var(--border-color) 9px, transparent 9px), ' +
            'radial-gradient(circle at top left, transparent 7px, var(--card-background) 7px)',
        },

        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: '-2px',
          right: '-9px',
          width: '9px',
          height: '9px',
          background:
            'radial-gradient(circle at top right, transparent 8px, var(--border-color) 8px, var(--border-color) 9px, transparent 9px), ' +
            'radial-gradient(circle at top right, transparent 7px, var(--card-background) 7px)',
        },
      },
    },

    '& .sp-editor': {
      '@media (max-width: 960px)': {
        flex: 'unset !important',
      },
    },

    '& .sp-preview-container': {
      background: 'var(--card-background) !important',
    },
  },

  variants: {
    fullscreen: {
      true: {
        '& .sp-layout': {
          width: '100%',
          height: '100%',
          margin: '0px',
          position: 'fixed !important',
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
        '& .sp-layout': {
          display: 'flex',
          margin: 'var(--space-5) 0px',
          gap: 'var(--space-4) !important',
          flexDirection: 'row !important',
          '@media (max-width: 960px)': {
            display: 'flex',
            flexDirection: 'column !important',
            width: '95vw',
            left: '50%',
            right: '50%',
            marginLeft: '-47.5vw',
            marginRight: '-47.5vw',
          },

          '@media (min-width: 960px)': {
            position: 'relative !important',
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
