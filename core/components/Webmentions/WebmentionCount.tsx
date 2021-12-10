import Flex from '@theme/components/Flex';
import React from 'react';
import { styled } from 'lib/stitches.config';

const initialCounts = {
  count: 0,
  type: {
    like: 0,
    mention: 0,
    reply: 0,
    repost: 0,
  },
};

const CountWrapper = styled(Flex, {
  p: {
    color: 'var(--maximeheckel-colors-brand) !important',
    fontSize: '14px',
    fontWeight: 500,
  },
});

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
    <CountWrapper>
      {counts === undefined && (
        <p data-testid="failed">Failed to load counts 😞</p>
      )}
      {counts && (
        <>
          <p data-testid="likes">
            {counts.type.like || 0}
            {' Likes '}&bull;
          </p>
          <p data-testid="replies">
            {' '}
            {counts.type.reply || 0}
            {' Replies '}&bull;
          </p>
          <p data-testid="reposts">
            {' '}
            {(counts.type.repost || 0) + (counts.type.mention || 0)}
            {' Mentions'}
          </p>
        </>
      )}
    </CountWrapper>
  );
};

export default WebmentionCount;
