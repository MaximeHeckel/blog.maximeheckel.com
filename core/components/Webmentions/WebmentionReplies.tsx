import { Anchor, Text } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Reply } from './types';

const Replies = dynamic(() => import('./Replies'));
interface Props {
  title: string;
  url: string;
}

const WebmentionReplies = ({ title, url }: Props) => {
  const [ref, inView] = useInView();
  const [page /*, setPage*/] = React.useState(0);
  const [fetchState, setFetchState] = React.useState('fetching');

  const [replies, setReplies] = React.useState<Reply[]>([]);
  const perPage = 500;
  const text = `${title} by @MaximeHeckel ${url}`;

  const getMentions = React.useCallback(
    () =>
      fetch(
        `https://webmention.io/api/mentions?page=${page}&per-page=${perPage}&target=${url}`
      ).then((response) => (response.json ? response.json() : response)),
    [page, url]
  );
  // const incrementPage = () => setPage((previousPage) => previousPage + 1);
  //   const fetchMore = () =>
  //     getMentions()
  //       .then((newReplies) => {
  //         if (newReplies.length) {
  //           setReplies(newReplies);
  //         } else {
  //           setFetchState('nomore');
  //         }
  //       })
  //       .then(incrementPage);

  React.useEffect(() => {
    getMentions().then((newReplies) => {
      setReplies(newReplies.links);
      setFetchState('done');
    });
  }, [getMentions]);

  if (fetchState === 'fetching') {
    return <p data-testid="fetching">Fetching Replies...</p>;
  }

  const distinctFans = new Set(
    replies
      .filter((reply) => reply.data.author)
      .map((reply) => reply.data.author.url)
  );

  const heightRow = 77;
  const numberOfRow = Math.ceil(replies.length / 17);

  return (
    <div ref={ref}>
      <Text as="p" weight="4" data-testid="main-text">
        {replies.length > 0
          ? `Already ${
              distinctFans.size > 1
                ? `${distinctFans.size} awesome people`
                : 'one awesome person'
            } liked, shared or talked about this article:`
          : 'Be the first one to share this article!'}
        <br />
      </Text>
      {inView ? (
        <Replies replies={replies} />
      ) : (
        <div style={{ height: heightRow * numberOfRow, width: '100%' }} />
      )}
      <Text as="p" data-testid="share-text">
        <Anchor
          href={`https://twitter.com/intent/tweet?text=${encodeURI(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          underline
        >
          Tweet about this post
        </Anchor>{' '}
        and it will show up here! Or,{' '}
        <Anchor
          href={`https://mobile.twitter.com/search?q=${url}`}
          target="_blank"
          rel="noopener noreferrer"
          underline
        >
          click here to leave a comment
        </Anchor>{' '}
        and discuss about it on Twitter.
      </Text>
    </div>
  );
};

export default WebmentionReplies;
