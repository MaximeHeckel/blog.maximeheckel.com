// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';

import { selectAskArticles } from '../askArticles';

const { library, systemOne } = vi.hoisted(() => ({
  library: vi.fn(),
  systemOne: vi.fn(),
}));
vi.mock('../articleCatalog', () => ({ readArticleLibrary: library }));
vi.mock('@typesafe-ai/sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@typesafe-ai/sdk')>()),
  TypeSafeClient: class {
    systemOne = systemOne;
  },
}));

const articles = ['a', 'b', 'c', 'd', 'e'].map((id) => ({
  id,
  title: `Article ${id}`,
  subtitle: 'Shaders',
  date: '2026-01-01',
  headings: ['Implementation'],
  path: `/posts/${id}/`,
  content: `Full opening for ${id}\n\n\`\`\`glsl\nvoid main() {}\n\`\`\`\n\nFinal explanation for ${id}`,
}));
beforeEach(() => {
  vi.clearAllMocks();
  library.mockResolvedValue(articles);
});

it('sends only metadata to Jev and returns up to three complete articles in relevance order', async () => {
  systemOne.mockResolvedValue({
    answers: {
      a: { noul: 0.71 },
      b: { noul: 0.99 },
      c: { noul: 0.85 },
      d: { noul: 0.95 },
      e: { noul: 0.1 },
      unknown: { noul: 1 },
    },
  });
  const signal = new AbortController().signal;
  const selected = await selectAskArticles(
    'How does this shader work?',
    'test',
    signal
  );
  expect(selected.map((article) => article.url)).toEqual([
    '/posts/b/',
    '/posts/d/',
    '/posts/c/',
  ]);
  expect(selected[0].content).toBe(articles[1].content);
  const request = systemOne.mock.calls[0][0];
  expect(request.state.query).toBe('How does this shader work?');
  expect(
    request.state.catalog.every((article: object) => !('content' in article))
  ).toBe(true);
  expect(JSON.stringify(request)).not.toContain('void main');
  expect(systemOne.mock.calls[0][1]).toEqual({ signal });
});

it('does not force a selection when no article is relevant', async () => {
  systemOne.mockResolvedValue({ answers: { a: { noul: 0.2 } } });
  expect(
    await selectAskArticles(
      'Unrelated question',
      'test',
      new AbortController().signal
    )
  ).toEqual([]);
});
