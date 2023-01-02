import {
  useSandpack,
  useSandpackConsole,
  useSandpackNavigation,
  UnstyledOpenInCodeSandboxButton,
} from '@codesandbox/sandpack-react';
import { Button, Box, Tooltip, Icon } from '@maximeheckel/design-system';

export const CustomRunButton = () => {
  const { sandpack } = useSandpack();
  const { status, runSandpack } = sandpack;

  if (status === 'running') {
    return null;
  }

  return (
    <Tooltip content="Run" side="top">
      <Button
        aria-label="Run"
        icon={<Icon.Play />}
        onClick={runSandpack}
        size="small"
        variant="icon"
      />
    </Tooltip>
  );
};

export const CustomRefreshButton = () => {
  const { refresh } = useSandpackNavigation();
  return (
    <Tooltip content="Refresh pane" side="top">
      <Button
        aria-label="Refresh pane"
        icon={<Icon.Repeat />}
        onClick={refresh}
        size="small"
        variant="icon"
      />
    </Tooltip>
  );
};

export const CustomGoToCodesandboxButton = () => {
  return (
    <Tooltip content="Open in Codesandbox" side="top">
      <Box>
        <Button
          aria-label="Open in Codesandbox"
          // @ts-ignore
          as={UnstyledOpenInCodeSandboxButton}
          icon={<Icon.Stack />}
          size="small"
          variant="icon"
        />
      </Box>
    </Tooltip>
  );
};

export const CustomClearConsoleButton = ({
  onClear,
}: {
  onClear: () => void;
}) => {
  const { reset } = useSandpackConsole();

  return (
    <Tooltip content="Clear console" side="top">
      <Button
        aria-label="Clear console"
        icon={<Icon.X />}
        onClick={() => {
          reset();
          onClear();
        }}
        size="small"
        variant="icon"
      />
    </Tooltip>
  );
};
