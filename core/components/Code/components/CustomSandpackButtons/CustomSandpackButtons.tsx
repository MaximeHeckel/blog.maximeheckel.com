import {
  useSandpack,
  useSandpackNavigation,
  UnstyledOpenInCodeSandboxButton,
  useSandpackConsole,
} from '@codesandbox/sandpack-react';
import { Box, Tooltip, IconButton } from '@maximeheckel/design-system';

const PlayIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      color="currentColor"
      fill="none"
    >
      <path
        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

export const CustomRunButton = () => {
  const { sandpack } = useSandpack();
  const { status, runSandpack } = sandpack;

  if (status === 'running') {
    return null;
  }

  return (
    <Box css={{ pointerEvents: 'auto' }}>
      <Tooltip content="Run" side="top">
        <IconButton
          aria-label="Run"
          onClick={runSandpack}
          size="medium"
          variant="tertiary"
        >
          <PlayIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const RepeatIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      color="currentColor"
      fill="none"
    >
      <path
        d="M20.5 5.5H9.5C5.78672 5.5 3 8.18503 3 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3.5 18.5H14.5C18.2133 18.5 21 15.815 21 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M18.5 3C18.5 3 21 4.84122 21 5.50002C21 6.15882 18.5 8 18.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M5.49998 16C5.49998 16 3.00001 17.8412 3 18.5C2.99999 19.1588 5.5 21 5.5 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
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
        <RepeatIcon />
      </IconButton>
    </Tooltip>
  );
};

const StackIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      color="currentColor"
      fill="none"
    >
      <path
        d="M8.64298 3.14559L6.93816 3.93362C4.31272 5.14719 3 5.75397 3 6.75C3 7.74603 4.31272 8.35281 6.93817 9.56638L8.64298 10.3544C10.2952 11.1181 11.1214 11.5 12 11.5C12.8786 11.5 13.7048 11.1181 15.357 10.3544L17.0618 9.56638C19.6873 8.35281 21 7.74603 21 6.75C21 5.75397 19.6873 5.14719 17.0618 3.93362L15.357 3.14559C13.7048 2.38186 12.8786 2 12 2C11.1214 2 10.2952 2.38186 8.64298 3.14559Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M20.788 11.0972C20.9293 11.2959 21 11.5031 21 11.7309C21 12.7127 19.6873 13.3109 17.0618 14.5072L15.357 15.284C13.7048 16.0368 12.8786 16.4133 12 16.4133C11.1214 16.4133 10.2952 16.0368 8.64298 15.284L6.93817 14.5072C4.31272 13.3109 3 12.7127 3 11.7309C3 11.5031 3.07067 11.2959 3.212 11.0972"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M20.3767 16.2661C20.7922 16.5971 21 16.927 21 17.3176C21 18.2995 19.6873 18.8976 17.0618 20.0939L15.357 20.8707C13.7048 21.6236 12.8786 22 12 22C11.1214 22 10.2952 21.6236 8.64298 20.8707L6.93817 20.0939C4.31272 18.8976 3 18.2995 3 17.3176C3 16.927 3.20778 16.5971 3.62334 16.2661"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
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
          <StackIcon />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

const CodeIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      color="currentColor"
      fill="none"
    >
      <path
        d="M18 16L19.8398 17.5858C20.6133 18.2525 21 18.5858 21 19C21 19.4142 20.6133 19.7475 19.8398 20.4142L18 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M14 16L12.1602 17.5858C11.3867 18.2525 11 18.5858 11 19C11 19.4142 11.3867 19.7475 12.1602 20.4142L14 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M20 13.0032L20 7.8199C20 6.12616 20 5.27929 19.732 4.60291C19.3013 3.51555 18.3902 2.65784 17.2352 2.25228C16.5168 2 15.6173 2 13.8182 2C10.6698 2 9.09563 2 7.83836 2.44148C5.81714 3.15122 4.22281 4.6522 3.46894 6.55509C3 7.73875 3 9.22077 3 12.1848L3 14.731C3 17.8013 3 19.3364 3.8477 20.4025C4.09058 20.708 4.37862 20.9792 4.70307 21.2078C5.61506 21.8506 6.85019 21.9757 9 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3 12C3 10.159 4.49238 8.66667 6.33333 8.66667C6.99912 8.66667 7.78404 8.78333 8.43137 8.60988C9.00652 8.45576 9.45576 8.00652 9.60988 7.43136C9.78333 6.78404 9.66667 5.99912 9.66667 5.33333C9.66667 3.49238 11.1591 2 13 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
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
        <CodeIcon />
      </IconButton>
    </Tooltip>
  );
};

const ClearIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      color="currentColor"
      fill="none"
    >
      <path
        d="M18 6L12 12M12 12L6 18M12 12L18 18M12 12L6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
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
        <ClearIcon />
      </IconButton>
    </Tooltip>
  );
};
