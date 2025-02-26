import { useSandpackNavigation } from '@codesandbox/sandpack-react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Text,
  Tooltip,
} from '@maximeheckel/design-system';
import React from 'react';

import {
  CustomClearConsoleButton,
  CustomGoToCodesandboxButton,
  CustomRefreshButton,
  CustomRunButton,
} from '../CustomSandpackButtons';
import { PreviewTabsProps } from './types';

const PreviewTabs = (props: PreviewTabsProps) => {
  const { selectedTab, onTabSelect, onClear, onFullscreen } = props;
  const { refresh } = useSandpackNavigation();

  return (
    <Flex
      css={{
        padding: '0 var(--space-2)',
        height: 40,
        width: '100%',
        borderBottom: '1px solid var(--border-color)',
      }}
      gap="2"
      justifyContent="space-between"
    >
      <Flex gap="2">
        <Box
          aria-selected={selectedTab === 'preview'}
          as="button"
          css={{
            background: 'transparent',
            cursor: 'pointer',
            border: 'none',

            '&:hover': {
              '& span': {
                color: 'var(--accent) !important',
              },
            },
          }}
          onClick={() => onTabSelect('preview')}
        >
          <Text
            css={{
              transition: 'color 150ms',
            }}
            size="1"
            variant={selectedTab === 'preview' ? 'info' : 'secondary'}
          >
            Preview
          </Text>
        </Box>
        <Box
          aria-selected={selectedTab === 'console'}
          as="button"
          css={{
            background: 'transparent',
            cursor: 'pointer',
            border: 'none',
            transition: 'color 150ms',
            '&:hover': {
              '& span': {
                color: 'var(--accent) !important',
              },
            },
          }}
          onClick={() => onTabSelect('console')}
        >
          <Text
            css={{
              transition: 'color 150ms',
            }}
            size="1"
            variant={selectedTab === 'console' ? 'info' : 'secondary'}
          >
            Console
          </Text>
        </Box>
      </Flex>
      <Flex>
        <CustomGoToCodesandboxButton />
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
              refresh();
            }}
            variant="tertiary"
            size="small"
          >
            <Icon.FullScreen />
          </IconButton>
        </Tooltip>
        <CustomRunButton />
        <CustomRefreshButton />
        <CustomClearConsoleButton
          // Workaround to make console clear work
          onClear={onClear}
        />
      </Flex>
    </Flex>
  );
};

export default PreviewTabs;
