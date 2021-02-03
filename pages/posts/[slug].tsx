import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import hydrate from 'next-mdx-remote/hydrate';
import React from 'react';
import getOgImage from 'lib/generate-opengraph-images';
import BlogLayout from 'layouts/BlogPost';
import { getFileBySlug, getFiles } from 'lib/mdx';
import { MDXComponents } from '@theme/components/MDX/MDXComponents';
import Tweet from '@theme/components/Tweet';
import { FrontMatterPost, PostType } from 'types/post';
import { getTweets } from 'lib/tweets';

interface BlogProps {
  post?: FrontMatterPost;
  ogImage: string;
  tweets: Record<string, any>; // TODO: write types for tweets
}

const Blog = ({ post, ogImage, tweets }: BlogProps) => {
  const { isFallback } = useRouter();

  if (isFallback || !post) {
    return <div>Loading...</div>;
  }

  const MyTweet = ({ id }: { id: string }) => {
    return <Tweet tweet={tweets[id]} />;
  };

  const content = hydrate(post.mdxSource, {
    components: {
      ...MDXComponents,
      MyTweet,
    },
  });

  return (
    <BlogLayout frontMatter={post.frontMatter} ogImage={ogImage}>
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
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const post = await getFileBySlug(PostType.BLOGPOST, params!.slug as string);
    const tweets = await getTweets(['1341062627221487616']);

    //  console.log(tweets);
    const ogImage = await getOgImage({
      title: post.frontMatter.title,
      background: post.frontMatter.colorFeatured,
      color: post.frontMatter.fontFeatured,
    });

    return { props: { post, ogImage, tweets } };
  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    return { notFound: true };
  }
};
