import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import readingTime from 'reading-time';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { FrontMatterPost, Post } from 'types/post';

import { rehypeFigure } from './rehype-figure';
import { rehypeMeta } from './rehype-meta';
import { rehypeSectionize } from './rehype-sectionize-fork';

const root = process.cwd();

export const getFiles = async () => {
  return fs
    .readdirSync(path.join(root, 'content'))
    .filter((file) => file.endsWith('.mdx'));
};

// Regex to find all the custom static tweets in a MDX file
const TWEET_RE = /<StaticTweet\sid="[0-9]+"\s\/>/g;

export const getFileBySlug = async (slug: string): Promise<FrontMatterPost> => {
  const source = fs.readFileSync(
    path.join(root, 'content', `${slug}.mdx`),
    'utf8'
  );

  const parsedFile = matter(source);

  const data = parsedFile.data;
  const content = parsedFile.content;

  const options = {
    mdxOptions: {
      rehypePlugins: [
        rehypeSlug,
        rehypeSectionize,
        rehypeMeta,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { className: ['anchor-link', 'space-window-top'] },
            content: {
              type: 'element',
              tagName: 'svg',
              properties: {
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 24 24',
                fill: 'none',
                width: '16',
                height: '16',
                className: ['anchor-icon'],
              },
              children: [
                {
                  type: 'element',
                  tagName: 'path',
                  properties: {
                    d: 'M10 19.0004L9.82843 19.1719C8.26634 20.734 5.73368 20.734 4.17158 19.1719L3.82843 18.8288C2.26634 17.2667 2.26633 14.734 3.82843 13.1719L7.17158 9.8288C8.73368 8.2667 11.2663 8.2667 12.8284 9.8288L13.1716 10.1719C13.8252 10.8256 14.2053 11.6491 14.312 12.5004',
                    stroke: 'currentColor',
                    strokeWidth: '2',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  },
                  children: [],
                },
                {
                  type: 'element',
                  tagName: 'path',
                  properties: {
                    d: 'M9.68799 12.5004C9.79463 13.3516 10.1748 14.1752 10.8284 14.8288L11.1715 15.1719C12.7336 16.734 15.2663 16.734 16.8284 15.1719L20.1715 11.8288C21.7336 10.2667 21.7336 7.73404 20.1715 6.17194L19.8284 5.8288C18.2663 4.2667 15.7336 4.2667 14.1715 5.8288L14 6.00037',
                    stroke: 'currentColor',
                    strokeWidth: '2',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  },
                  children: [],
                },
              ],
            },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
        rehypeFigure,
      ],
    },
  };

  const mdxSource = await serialize(content, options);

  // TODO: maybe we want to extract this in its own lib?
  /**
   * Find all occurrence of <StaticTweet id="NUMERIC_TWEET_ID"/>
   * in the content of the MDX blog post
   */
  const tweetMatch = content.match(TWEET_RE);

  /**
   * For all occurrences / matches, extract the id portion of the
   * string, i.e. anything matching the regex /[0-9]+/g
   *
   * tweetIDs then becomes an array of string where each string is
   * the id of a tweet.
   * These IDs are then passed to the getTweets function to be fetched from
   * the Twitter API.
   */
  const tweetIDs = tweetMatch?.map((mdxTweet) => {
    const id = mdxTweet.match(/[0-9]+/g)![0];
    return id;
  });

  const result = {
    mdxSource,
    tweetIDs: tweetIDs || [],
    frontMatter: {
      readingTime: readingTime(content),
      ...data,
    },
  };

  return result as unknown as FrontMatterPost;
};

export const getAllFilesFrontMatter = async (): Promise<Array<Post>> => {
  const files = fs.readdirSync(path.join(root, 'content'));

  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((postSlug: string) => {
      const source = fs.readFileSync(
        path.join(root, 'content', postSlug),
        'utf8'
      );
      const parsedFile = matter(source);

      return parsedFile.data as Post;
    })
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts;
};
