import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export type ReadingTime = {
  text: string;
};

export type Post = {
  colorFeatured?: string;
  date: string;
  updated: string;
  featured?: boolean;
  fontFeatured?: string;
  keywords?: string[];
  slug: string;
  subtitle: string;
  title: string;
};

export type FrontMatterPost = {
  frontMatter: Post & {
    readingTime: ReadingTime;
  };
  tweetIDs: string[];
  mdxSource: MDXRemoteSerializeResult;
};
