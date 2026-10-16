import {
  useSandpack,
  useSandpackNavigation,
  UnstyledOpenInCodeSandboxButton,
  useSandpackConsole,
} from '@codesandbox/sandpack-react';
import { Box, Tooltip, IconButton, Icon } from '@maximeheckel/design-system';

export const CustomRunButton = () => {
  const { sandpack } = useSandpack();
  const { status, runSandpack } = sandpack;

  if (status === 'running') {
    return null;
  }

  return (
    <Box
      css={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--card-background)',

        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle, oklch(from var(--text-tertiary) l c h / 35%) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
          backgroundPosition: 'center',
          maskImage:
            'radial-gradient(circle 200px at center, black 20%, transparent 100%)',
        },
      }}
    >
      <Tooltip content="Run sandbox" side="top">
        <IconButton
          aria-label="Run sandbox"
          type="button"
          onClick={runSandpack}
          size="large"
          variant="secondary"
          rounded
          css={{
            position: 'relative',
            transform: 'none',

            '& svg': {
              transform: 'translateX(1px)',
            },

            '&:focus-visible': {
              outline: '2px solid var(--accent)',
              outlineOffset: 3,
            },
          }}
        >
          <Icon.Play aria-hidden="true" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const CustomRefreshButton = () => {
  const { refresh } = useSandpackNavigation();
  return (
    <Tooltip content="Refresh pane" side="top">
      <IconButton
        aria-label="Refresh pane"
        onClick={refresh}
        size="small"
        variant="tertiary"
      >
        <Icon.Repeat />
      </IconButton>
    </Tooltip>
  );
};

export const CustomGoToCodesandboxButton = () => {
  return (
    <Tooltip content="Open in Codesandbox" side="top">
      <Box>
        <IconButton
          aria-label="Open in Codesandbox"
          // @ts-ignore
          as={UnstyledOpenInCodeSandboxButton}
          size="small"
          variant="tertiary"
        >
          <Icon.Stack />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

export const CustomToggleCodeButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <Tooltip content="Toggle code" side="top">
      <IconButton
        aria-label="Toggle code"
        onClick={onClick}
        size="small"
        variant="tertiary"
      >
        <Icon.Code />
      </IconButton>
    </Tooltip>
  );
};

export const CustomClearConsoleButton = ({
  onClear,
}: {
  onClear: () => void;
}) => {
  const { reset } = useSandpackConsole({
    resetOnPreviewRestart: true,
  });

  return (
    <Tooltip content="Clear console" side="top">
      <IconButton
        aria-label="Clear console"
        onClick={() => {
          reset();
          onClear();
        }}
        size="small"
        variant="tertiary"
      >
        <Icon.Clear />
      </IconButton>
    </Tooltip>
  );
};
