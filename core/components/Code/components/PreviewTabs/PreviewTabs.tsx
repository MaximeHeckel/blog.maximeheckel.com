import {
  Box,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from '@maximeheckel/design-system';
import React from 'react';

import {
  CustomClearConsoleButton,
  CustomGoToCodesandboxButton,
  CustomToggleCodeButton,
  CustomRefreshButton,
} from '../CustomSandpackButtons';
import { PreviewTabsProps } from './types';

const FullscreenIcon = () => {
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
        d="M15.5 21C16.8956 21 17.5933 21 18.1611 20.8278C19.4395 20.44 20.44 19.4395 20.8278 18.1611C21 17.5933 21 16.8956 21 15.5M21 8.5C21 7.10444 21 6.40666 20.8278 5.83886C20.44 4.56046 19.4395 3.56004 18.1611 3.17224C17.5933 3 16.8956 3 15.5 3M8.5 21C7.10444 21 6.40666 21 5.83886 20.8278C4.56046 20.44 3.56004 19.4395 3.17224 18.1611C3 17.5933 3 16.8956 3 15.5M3 8.5C3 7.10444 3 6.40666 3.17224 5.83886C3.56004 4.56046 4.56046 3.56004 5.83886 3.17224C6.40666 3 7.10444 3 8.5 3"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  );
};

const PreviewTabs = (props: PreviewTabsProps) => {
  const { selectedTab, onTabSelect, onClear, onFullscreen, onToggleCode } =
    props;

  return (
    <Flex
      css={{
        padding: '0 var(--space-2)',
        background: 'var(--background)',
        minHeight: 48,
        width: '100%',
        borderBottom: '1px solid var(--border-color)',
      }}
      gap="2"
      justifyContent="space-between"
    >
      <Flex gap="1">
        <CustomToggleCodeButton onClick={onToggleCode} />
        <Box
          aria-selected={selectedTab === 'preview'}
          as="button"
          css={{
            cursor: 'pointer',
            '--tab-border-color': 'transparent',
            border: '1px solid var(--tab-border-color)',
            borderRadius: 'var(--border-radius-1)',
            height: 'var(--space-6)',
            padding: '0 var(--space-3)',
            transition: 'color 150ms',
            '&:hover': {
              '& span': {
                color: 'var(--text-secondary) !important',
              },
            },
          }}
          onClick={() => onTabSelect('preview')}
          style={{
            background:
              selectedTab === 'preview' ? 'var(--foreground)' : 'transparent',
            // @ts-ignore
            '--tab-border-color':
              selectedTab === 'preview' ? 'var(--border-color)' : 'transparent',
          }}
        >
          <Text
            css={{
              transition: 'color 150ms',
            }}
            size="1"
            variant={selectedTab === 'preview' ? 'primary' : 'tertiary'}
          >
            Preview
          </Text>
        </Box>
        <Box
          aria-selected={selectedTab === 'console'}
          as="button"
          css={{
            cursor: 'pointer',
            '--tab-border-color': 'transparent',
            border: '1px solid var(--tab-border-color)',
            borderRadius: 'var(--border-radius-1)',
            height: 'var(--space-6)',
            padding: '0 var(--space-3)',
            transition: 'color 150ms',
            '&:hover': {
              '& span': {
                color: 'var(--text-secondary) !important',
              },
            },
          }}
          onClick={() => onTabSelect('console')}
          style={{
            background:
              selectedTab === 'console' ? 'var(--foreground)' : 'transparent',
            // @ts-ignore
            '--tab-border-color':
              selectedTab === 'console' ? 'var(--border-color)' : 'transparent',
          }}
        >
          <Text
            css={{
              transition: 'color 150ms',
            }}
            size="1"
            variant={selectedTab === 'console' ? 'primary' : 'tertiary'}
          >
            Console
          </Text>
        </Box>
      </Flex>
      <Flex>
        {selectedTab === 'preview' ? (
          <>
            <Tooltip content="Fullscreen" side="top">
              <IconButton
                aria-label="Fullscreen"
                css={{
                  display: 'flex',
                  '@media (max-width: 750px)': {
                    display: 'none',
                  },
                }}
                onClick={() => {
                  onFullscreen();
                }}
                variant="tertiary"
                size="small"
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            <CustomRefreshButton />
            <CustomGoToCodesandboxButton />
          </>
        ) : null}
        {selectedTab === 'console' ? (
          <CustomClearConsoleButton
            // Workaround to make console clear work
            onClear={onClear}
          />
        ) : null}
      </Flex>
    </Flex>
  );
};

export default PreviewTabs;
