import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React from 'react';
import { RepliesProps, Reply } from './types';

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

export default Replies;
