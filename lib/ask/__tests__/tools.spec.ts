import { expect, it, vi } from 'vitest';

import catalog from '../catalog.json';
import { createAskTools } from '../tools';

const options = {
  toolCallId: 'call',
  messages: [],
  abortSignal: new AbortController().signal,
};
const passage = {
  title: 'Shaders',
  url: '/posts/shaders/',
  content: 'Shader evidence',
};

it('retrieves bounded evidence and propagates cancellation', async () => {
  const search = vi.fn().mockResolvedValue(
    Array.from({ length: 12 }, () => ({
      ...passage,
      content: 'x'.repeat(4000),
    }))
  );
  const tools = createAskTools(search);
  const result = await tools.retrievePassages.execute!(
    { query: 'Explain shaders' },
    options
  );
  expect(search).toHaveBeenCalledWith('Explain shaders', {
    count: 12,
    signal: options.abortSignal,
  });
  expect(result).toEqual({
    passages: Array.from({ length: 8 }, () => ({
      ...passage,
      content: 'x'.repeat(3000),
    })),
  });
});

it('recommendations return unique article links without passage content', async () => {
  const search = vi.fn().mockResolvedValue([
    passage,
    { ...passage, url: '/posts/shaders/#another-section' },
    {
      title: 'Lighting',
      url: '/posts/lighting/',
      content: 'Lighting evidence',
    },
  ]);
  const tools = createAskTools(search);
  expect(
    await tools.recommendArticles.execute!(
      { query: 'What should I read next?' },
      options
    )
  ).toEqual({
    articles: [
      { title: 'Shaders', url: '/posts/shaders/' },
      { title: 'Lighting', url: '/posts/lighting/' },
    ],
  });
  expect(search).toHaveBeenCalledTimes(1);
});

it('bounds combined tool executions per request', async () => {
  const search = vi.fn().mockResolvedValue([]);
  const tools = createAskTools(search);
  for (let i = 0; i < 4; i++)
    await tools.retrievePassages.execute!({ query: 'Shaders' }, options);
  await expect(
    tools.recommendArticles.execute!({ query: 'Shaders' }, options)
  ).rejects.toThrow('budget exhausted');
  expect(search).toHaveBeenCalledTimes(4);
});

it('loads the complete static catalog without semantic search', async () => {
  const search = vi.fn();
  const tools = createAskTools(search);
  const result = await tools.getArticleCatalog.execute!({}, options);

  expect(result).toEqual({ articles: catalog });
  expect(search).not.toHaveBeenCalled();
});
