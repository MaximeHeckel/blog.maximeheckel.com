import getOgImage from 'lib/generate-opengraph-images';
import { getFileBySlug, getFiles } from 'lib/mdx';
import { getTweets } from 'lib/tweets';
import { GetStaticProps, GetStaticPaths } from 'next';
import { MDXRemote } from 'next-mdx-remote';
import { useRouter } from 'next/router';
import { FrontMatterPost } from 'types/post';
import { NewTweet } from 'types/tweet';

import MDXComponents from '@core/components/MDX/MDXComponents';
import Tweet from '@core/components/Tweet';
import { BlogPost } from '@core/features/BlogPost';

interface BlogProps {
  post?: FrontMatterPost;
  ogImage: string;
  tweets: Record<string, NewTweet>;
}

const Blog = ({ post, ogImage, tweets }: BlogProps) => {
  const { isFallback } = useRouter();

  if (isFallback || !post) {
    return <div>Loading...</div>;
  }

  const StaticTweet = ({ id }: { id: string }) => {
    return <Tweet tweet={tweets[id]} />;
  };

  return (
    <BlogPost frontMatter={post.frontMatter} ogImage={ogImage}>
      <MDXRemote
        {...post.mdxSource}
        components={{
          ...MDXComponents,
          StaticTweet,
        }}
      />
    </BlogPost>
  );
};

export default Blog;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getFiles();

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
    const post = await getFileBySlug(params!.slug as string);

    /**
     * Get tweets from API
     */
    const tweets =
      post.tweetIDs.length > 0 ? await getTweets(post.tweetIDs) : {};

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
