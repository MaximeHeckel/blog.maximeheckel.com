import { Box, Flex, Text } from '@maximeheckel/design-system';

export const DiagramLabel = ({
  compute = 'x1 per frame',
  render = 'x1 per frame',
}: {
  compute: string;
  render: string;
}) => {
  return (
    <Box css={{ position: 'relative', height: '1px' }}>
      <Flex alignItems="stretch" direction="column" gap="2">
        <Flex alignItems="center" justifyContent="space-between">
          <Text
            aria-hidden
            css={{ textTransform: 'uppercase' }}
            variant="tertiary"
            family="mono"
            size="2"
          >
            Compute Pipeline
          </Text>
          <Text
            aria-hidden
            css={{ textAlign: 'right' }}
            variant="tertiary"
            family="mono"
            size="2"
          >
            {compute}
          </Text>
        </Flex>
        <Box
          css={{
            height: '1px',
            width: '100%',
            borderBottom: '2px dotted var(--text-tertiary)',
            zIndex: 1,
          }}
        />
        <Flex alignItems="center" justifyContent="space-between">
          <Text
            aria-hidden
            css={{ textTransform: 'uppercase' }}
            variant="tertiary"
            family="mono"
            size="2"
          >
            Render Pipeline
          </Text>
          <Text
            aria-hidden
            css={{ textAlign: 'right' }}
            variant="tertiary"
            family="mono"
            size="2"
          >
            {render}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};
