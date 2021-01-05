import { GetStaticProps, GetStaticPaths } from 'next';
import hydrate from 'next-mdx-remote/hydrate';
import React from 'react';
import getOgImage from 'lib/generate-opengraph-images';
import BlogLayout from 'layouts/BlogPost';
import { getFileBySlug, getFiles } from 'lib/mdx';
import { MDXComponents } from '@theme/components/MDX/MDXComponents';
import { FrontMatterPost, PostType } from 'types/post';

interface BlogProps {
  post: FrontMatterPost;
  ogImage: string;
}

const Blog = ({ post: { mdxSource, frontMatter }, ogImage }: BlogProps) => {
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  });

  return (
    <BlogLayout frontMatter={frontMatter} ogImage={ogImage}>
      {content}
    </BlogLayout>
  );
};

export default Blog;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getFiles(PostType.BLOGPOST);

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
  const post = await getFileBySlug(PostType.BLOGPOST, params!.slug as string);

  const ogImage = await getOgImage({
    title: post.frontMatter.title,
    background: post.frontMatter.colorFeatured,
    color: post.frontMatter.fontFeatured,
  });

  return { props: { post, ogImage } };
};
