import { motion } from 'framer-motion';
import React from 'react';
import { useInView } from 'react-intersection-observer';
// import ReactTooltip from 'react-tooltip';
import styled from '@emotion/styled';

const RepliesList = styled(motion.ul)`
  display: flex;
  flex-wrap: wrap;
  margin-left: 0px;
  margin-bottom: 8px;
  margin-top: 15px;
  li {
    margin-right: -10px;
  }
`;

const Head = styled(motion.li)`
  list-style: none;

  img {
    border-radius: 50%;
    border: 3px solid var(--maximeheckel-colors-brand);
  }
`;

type Reply = {
  source: URL;
  target: URL;
  verified: boolean;
  verified_date: string;
  id: number;
  private: boolean;
  activity: {
    type: string;
    sentence: string;
    sentence_html: string;
  };
  data: {
    author: {
      name: string;
      url: string;
      photo: string;
    };
    url: string;
  };
};

interface RepliesProps {
  replies: Reply[];
}

const list = {
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
    },
  },
};

const item = {
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: -10 },
};

const Replies = ({ replies }: RepliesProps) => {
  const sanitizedReplies = replies
    .filter((reply) => reply.data.url.includes('https://twitter.com'))
    .reduce((acc: Record<string, Reply>, item: Reply) => {
      if (item.data?.author?.url && !acc[item.data.author.url]) {
        acc[item.data.author.url] = item;
        return acc;
      }

      return acc;
    }, {});

  return (
    <>
      {Object.values(sanitizedReplies) &&
      Object.values(sanitizedReplies).length ? (
        <RepliesList initial="hidden" animate="visible" variants={list}>
          {Object.values(sanitizedReplies)
            .filter((link) => link.data.author)
            .map((link) => (
              <Head
                key={link.id}
                data-testid={link.id}
                data-tip={link.activity.sentence}
                variants={item}
                whileHover={{
                  marginRight: '2px',
                  transition: { ease: 'easeOut' },
                }}
              >
                <a
                  href={link.data.author.url}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                >
                  <img
                    height={50}
                    width={50}
                    src={link.data.author.photo}
                    alt={`avatar of ${link.data.author.name}`}
                  />
                </a>
              </Head>
            ))}
          {/* <ReactTooltip place="top" effect="solid" /> */}
        </RepliesList>
      ) : null}
    </>
  );
};

interface Props {
  title: string;
  url: string;
}

const WebmentionReplies = ({ title, url }: Props) => {
  const [ref, inView] = useInView();
  const [page, setPage] = React.useState(0);
  const [fetchState, setFetchState] = React.useState('fetching');

  const mergeReplies = (oldReplies: Reply[], newReplies: Reply[]) => [
    ...oldReplies,
    ...newReplies,
  ];
  const [replies, setReplies] = React.useReducer(mergeReplies, []);
  const perPage = 500;
  const text = `${title} by @MaximeHeckel ${url}`;

  const getMentions = React.useCallback(
    () =>
      fetch(
        `https://webmention.io/api/mentions?page=${page}&per-page=${perPage}&target=${url}`
      ).then((response) => (response.json ? response.json() : response)),
    [page, url]
  );
  const incrementPage = () => setPage((previousPage) => previousPage + 1);
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
    getMentions()
      .then((newReplies) => {
        setReplies(newReplies.links);
        setFetchState('done');
      })
      .then(incrementPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <strong>
        <p data-testid="main-text">
          {replies.length > 0
            ? `Already ${
                distinctFans.size > 1
                  ? `${distinctFans.size} awesome people`
                  : 'one awesome person'
              } liked, shared or talked about this article:`
            : 'Be the first one to share this article!'}
          <br />
        </p>
      </strong>
      {inView ? (
        <Replies replies={replies} />
      ) : (
        <div style={{ height: heightRow * numberOfRow, width: '100%' }} />
      )}
      <p data-testid="share-text">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURI(text)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tweet about this post
        </a>{' '}
        and it will show up here! Or,{' '}
        <a
          href={`https://mobile.twitter.com/search?q=${url}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          click here to leave a comment
        </a>{' '}
        and discuss about it on Twitter.
      </p>
    </div>
  );
};

export { WebmentionReplies };
