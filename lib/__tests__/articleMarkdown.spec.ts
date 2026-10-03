// @vitest-environment node
import fs from 'fs';

import { beforeEach, expect, it, vi } from 'vitest';

import { getFileBySlug, getMarkdownBySlug } from '../mdx';

vi.mock('next-mdx-remote/serialize', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('next-mdx-remote/serialize')>();
  return { ...original, serialize: vi.fn(original.serialize) };
});
vi.mock('../tweets', () => ({ getTweets: vi.fn(async () => ({})) }));

vi.mock('@core/components/MDX/MDXComponents', () => ({ default: {} }));
vi.mock('@core/components/Tweet', () => ({ default: () => null }));
vi.mock('@core/features/BlogPost', () => ({ BlogPost: () => null }));

beforeEach(() => vi.clearAllMocks());

it('preserves the original MDX source, including frontmatter and component tags', async () => {
  const slug = 'learning-in-public';
  const post = await getMarkdownBySlug(slug);
  expect(post.markdown).toBe(fs.readFileSync(`content/${slug}.mdx`, 'utf8'));
});

it('keeps large Markdown pages below the page data threshold without compiling MDX or fetching tweets', async () => {
  const { serialize } = await import('next-mdx-remote/serialize');
  const { getTweets } = await import('../tweets');
  const { getStaticProps } = await import('../../pages/posts/[slug]');
  const result = await getStaticProps({
    params: { slug: 'on-rendering-the-sky-sunsets-and-planets.md' },
  });
  if (!('props' in result)) throw new Error('Expected article props');
  const props = await result.props;
  expect(props.post.markdown).toBe(
    fs.readFileSync(
      'content/on-rendering-the-sky-sunsets-and-planets.mdx',
      'utf8'
    )
  );
  expect(props.post).not.toHaveProperty('mdxSource');
  expect(props.post).not.toHaveProperty('tweetIDs');
  expect(props.tweets).toEqual({});
  expect(serialize).not.toHaveBeenCalled();
  expect(getTweets).not.toHaveBeenCalled();
  expect(Buffer.byteLength(JSON.stringify(props))).toBeLessThan(128 * 1024);
});

it('omits Markdown from normal article page data', async () => {
  const { getStaticProps } = await import('../../pages/posts/[slug]');
  const result = await getStaticProps({
    params: { slug: 'learning-in-public' },
  });
  expect(result).toMatchObject({
    props: {
      post: {
        frontMatter: { slug: 'learning-in-public' },
        mdxSource: expect.any(Object),
      },
    },
  });
  if (!('props' in result)) throw new Error('Expected article props');
  const props = await result.props;
  expect(props.post).not.toHaveProperty('markdown');
  expect(await getFileBySlug('learning-in-public')).not.toHaveProperty(
    'markdown'
  );
});

it('generates both Human and .md paths for every article', async () => {
  const { getStaticPaths } = await import('../../pages/posts/[slug]');
  const result = await getStaticPaths({});
  expect(result.fallback).toBe('blocking');
  expect(result.paths).toContainEqual({
    params: { slug: 'learning-in-public' },
  });
  expect(result.paths).toContainEqual({
    params: { slug: 'learning-in-public.md' },
  });
  expect(result.paths).toHaveLength(
    fs.readdirSync('content').filter((file) => file.endsWith('.mdx')).length * 2
  );
});

it('loads a direct .md URL using its original article and returns 404 for unknown slugs', async () => {
  const { getStaticProps } = await import('../../pages/posts/[slug]');
  const result = await getStaticProps({
    params: { slug: 'learning-in-public.md' },
  });
  expect(result).toMatchObject({
    props: {
      post: {
        frontMatter: { slug: 'learning-in-public' },
        markdown: fs.readFileSync('content/learning-in-public.mdx', 'utf8'),
      },
    },
  });
  expect(
    await getStaticProps({ params: { slug: 'unknown-article.md' } })
  ).toEqual({ notFound: true });
  expect(
    await getStaticProps({ params: { slug: '../package.json.md' } })
  ).toEqual({ notFound: true });
});
