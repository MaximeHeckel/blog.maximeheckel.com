import {
  useSandpack,
  useSandpackNavigation,
  UnstyledOpenInCodeSandboxButton,
  useSandpackConsole,
} from '@codesandbox/sandpack-react';
import { Box, Tooltip, Icon, IconButton } from '@maximeheckel/design-system';

export const CustomRunButton = () => {
  const { sandpack } = useSandpack();
  const { status, runSandpack } = sandpack;

  if (status === 'running') {
    return null;
  }

  return (
    <Tooltip content="Run" side="top">
      <IconButton
        aria-label="Run"
        onClick={runSandpack}
        size="small"
        variant="tertiary"
      >
        <Icon.Play />
      </IconButton>
    </Tooltip>
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
        <Icon.X />
      </IconButton>
    </Tooltip>
  );
};
