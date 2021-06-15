import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { MDXRemote } from 'next-mdx-remote';
import BlogLayout from 'layouts/BlogPost';
import getOgImage from 'lib/generate-opengraph-images';
import { getTweets } from 'lib/tweets';
import { getFileBySlug, getFiles } from 'lib/mdx';
import MDXComponents from '@theme/components/MDX/MDXComponents';
import Tweet from '@theme/components/Tweet';
import { FrontMatterPost, PostType } from 'types/post';

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

  const StaticTweet = ({ id }: { id: string }) => {
    return <Tweet tweet={tweets[id]} />;
  };

  return (
    <BlogLayout frontMatter={post.frontMatter} ogImage={ogImage}>
      <MDXRemote
        {...post.mdxSource}
        components={{
          ...MDXComponents,
          StaticTweet,
        }}
      />
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

    /**
     * Get tweets from API
     */
    const tweets =
      // TODO: write proper return types for getTweets
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
