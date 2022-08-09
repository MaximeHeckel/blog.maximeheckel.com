import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';
import { serialize } from 'next-mdx-remote/serialize';
import { FrontMatterPostType, PostByType, PostType } from 'types/post';
import { remarkSectionize } from './remark-sectionize-fork';
import { remarkFigure } from './remark-figure';
import { remarkMeta } from './remark-meta';

const typeToPath = {
  [PostType.BLOGPOST]: 'content',
  [PostType.SNIPPET]: 'snippets',
};

const root = process.cwd();

export const getFiles = async (type: PostType) => {
  return fs.readdirSync(path.join(root, typeToPath[type]));
};

// Regex to find all the custom static tweets in a MDX file
const TWEET_RE = /<StaticTweet\sid="[0-9]+"\s\/>/g;

export const getFileBySlug = async <T extends PostType>(
  type: T,
  slug: string
): Promise<FrontMatterPostType<T>> => {
  const source = fs.readFileSync(
    path.join(root, typeToPath[type], `${slug}.mdx`),
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

  if (type === PostType.BLOGPOST) {
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

    return (result as unknown) as FrontMatterPostType<T>;
  }

  return ({
    mdxSource,
    frontMatter: data,
  } as unknown) as FrontMatterPostType<T>;
};

export const getAllFilesFrontMatter = async <T extends PostType>(
  type: T
): Promise<Array<PostByType<T>>> => {
  const files = fs.readdirSync(path.join(root, typeToPath[type]));

  const posts = files
    .map((postSlug: string) => {
      const source = fs.readFileSync(
        path.join(root, typeToPath[type], postSlug),
        'utf8'
      );
      const parsedFile = matter(source);

      return parsedFile.data as PostByType<T>;
    })
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts;
};
