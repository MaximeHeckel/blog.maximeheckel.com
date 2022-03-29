import { Flex, Text } from '@maximeheckel/design-system';
import React from 'react';

const initialCounts = {
  count: 0,
  type: {
    like: 0,
    mention: 0,
    reply: 0,
    repost: 0,
  },
};

const fetchCounts = async (target: string) =>
  fetch(
    `https://webmention.io/api/count.json?target=${target}`
  ).then((response) => (response.json ? response.json() : response));

const WebmentionCount = ({ target }: { target: string }) => {
  const [counts, setCounts] = React.useState(initialCounts);

  React.useEffect(() => {
    async function getCounts() {
      const responseCounts = await fetchCounts(target);
      setCounts(responseCounts);
    }

    getCounts();
  }, [target]);

  return (
    <Flex>
      {counts === undefined && (
        <Text as="p" data-testid="failed">
          Failed to load counts 😞
        </Text>
      )}
      {counts && (
        <>
          <Text
            as="p"
            size="1"
            weight="3"
            variant="info"
            css={{ marginBottom: 0 }}
            data-testid="likes"
          >
            {counts.type.like || 0}
            {' Likes '}&bull;
          </Text>
          <Text
            as="p"
            size="1"
            weight="3"
            variant="info"
            css={{ marginBottom: 0 }}
            data-testid="replies"
          >
            {' '}
            {counts.type.reply || 0}
            {' Replies '}&bull;
          </Text>
          <Text
            as="p"
            size="1"
            weight="3"
            variant="info"
            css={{ marginBottom: 0 }}
            data-testid="reposts"
          >
            {' '}
            {(counts.type.repost || 0) + (counts.type.mention || 0)}
            {' Mentions'}
          </Text>
        </>
      )}
    </Flex>
  );
};

export default WebmentionCount;
