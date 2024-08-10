import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';
import { serialize } from 'next-mdx-remote/serialize';
import { FrontMatterPost, Post } from 'types/post';
import { remarkSectionize } from './remark-sectionize-fork';
import { remarkFigure } from './remark-figure';
import { remarkMeta } from './remark-meta';

const root = process.cwd();

export const getFiles = async () => {
  return fs
    .readdirSync(path.join(root, 'content'))
    .filter((file) => file.endsWith('.mdx'));
};

// Regex to find all the custom static tweets in a MDX file
const TWEET_RE = /<StaticTweet\sid="[0-9]+"\s\/>/g;

export const getFileBySlug = async (slug: string): Promise<FrontMatterPost> => {
  // eslint-disable-next-line no-console

  const source = fs.readFileSync(
    path.join(root, 'content', `${slug}.mdx`),
    'utf8'
  );

  const parsedFile = matter(source);

  const data = parsedFile.data;
  const content = parsedFile.content;

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [
        require('remark-slug'),
        require('remark-autolink-headings'),
        remarkSectionize,
        remarkFigure,
      ],
      rehypePlugins: [remarkMeta],
    },
  });

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

  return (result as unknown) as FrontMatterPost;

  return ({
    mdxSource,
    frontMatter: data,
  } as unknown) as FrontMatterPost;
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
