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
  CustomToggleCodeButton,
  CustomRefreshButton,
} from '../CustomSandpackButtons';
import { PreviewTabsProps } from './types';

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
                <Icon.FullScreen />
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
