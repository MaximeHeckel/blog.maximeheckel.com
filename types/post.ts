import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export enum PostType {
  SNIPPET = 'snippet',
  BLOGPOST = 'blogPost',
}

export type ReadingTime = {
  text: string;
};

export type Post = {
  colorFeatured?: string;
  cover?: string;
  date: string;
  updated: string;
  featured?: boolean;
  fontFeatured?: string;
  keywords?: string[];
  slug: string;
  subtitle: string;
  title: string;
  type: PostType.BLOGPOST;
};

export type FrontMatterPost = {
  frontMatter: Post & {
    readingTime: ReadingTime;
  };
  tweetIDs: string[];
  mdxSource: MDXRemoteSerializeResult;
};

export type Snippet = {
  date: string;
  language: string;
  slug: string;
  title: string;
  description: string;
  snippetImage: string;
  type: PostType.SNIPPET;
};

export type FrontMatterSnippet = {
  frontMatter: Snippet;
  mdxSource: MDXRemoteSerializeResult;
};

export type PostByType<T> = T extends PostType.BLOGPOST ? Post : Snippet;

export type FrontMatterPostType<T> = T extends PostType.BLOGPOST
  ? FrontMatterPost
  : FrontMatterSnippet;
