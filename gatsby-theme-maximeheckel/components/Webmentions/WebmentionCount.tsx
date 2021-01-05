import React from 'react';
import Flex from '../Flex';
import styled from '@emotion/styled';

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

  // Get counts on `target` change.
  React.useEffect(() => {
    async function getCounts() {
      const responseCounts = await fetchCounts(target);
      setCounts((previousCounts) => {
        return {
          ...previousCounts,
          ...responseCounts,
          type: {
            ...previousCounts.type,
            ...responseCounts.type,
          },
        };
      });
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
            {counts.type.repost || 0}
            {' Reposts'}
          </p>
        </>
      )}
    </CountWrapper>
  );
};

const CountWrapper = styled(Flex)`
  p {
    color: var(--maximeheckel-colors-brand) !important;
    font-size: 14px;
    font-weight: 500;
  }
`;

export { WebmentionCount };
