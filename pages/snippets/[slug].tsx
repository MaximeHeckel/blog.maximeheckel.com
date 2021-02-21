import { GetStaticProps, GetStaticPaths } from 'next';
import hydrate from 'next-mdx-remote/hydrate';
import React from 'react';
import SnippetLayout from 'layouts/Snippet';
import { getFileBySlug, getFiles } from 'lib/mdx';
import Code from '@theme/components/MDX/Code';
import { FrontMatterSnippet, PostType } from 'types/post';
interface SnippetProps {
  snippet: FrontMatterSnippet;
}

export default function Snippet({
  snippet: { mdxSource, frontMatter },
}: SnippetProps) {
  const content = hydrate(mdxSource, {
    components: {
      pre: Code,
    },
  });

  return <SnippetLayout frontMatter={frontMatter}>{content}</SnippetLayout>;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getFiles(PostType.SNIPPET);

  return {
    paths: posts.map((p) => ({
      params: {
        slug: p.replace(/\.mdx/, ''),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const snippet = await getFileBySlug(PostType.SNIPPET, params!.slug as string);
  return { props: { snippet } };
};
