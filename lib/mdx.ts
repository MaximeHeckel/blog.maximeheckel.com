import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';
import renderToString from 'next-mdx-remote/render-to-string';
import { MDXComponents } from '@theme/components/MDX/MDXComponents';
import { FrontMatterPostType, PostByType, PostType } from 'types/post';
import { remarkSectionize } from './remark-sectionize-fork';
import { remarkFigure } from './remark-figure';

const typeToPath = {
  [PostType.BLOGPOST]: 'content',
  [PostType.SNIPPET]: 'snippets',
};

const root = process.cwd();

export const getFiles = async (type: PostType) => {
  return fs.readdirSync(path.join(root, typeToPath[type]));
};

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

  const mdxSource = await renderToString(content, {
    components: MDXComponents,
    mdxOptions: {
      remarkPlugins: [
        require('remark-slug'),
        require('remark-autolink-headings'),
        remarkSectionize,
        remarkFigure,
      ],
    },
  });

  if (type === PostType.BLOGPOST) {
    const result = {
      mdxSource,
      frontMatter: {
        readingTime: readingTime(content),
        ...data,
      },
    };

    return (result as unknown) as FrontMatterPostType<T>;
  }

  return {
    mdxSource,
    frontMatter: data,
  } as FrontMatterPostType<T>;
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
