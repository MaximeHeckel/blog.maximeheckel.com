import { expect, it } from 'vitest';

import { contextTokenUpperBound, selectContext } from '../semanticContext';

const document = (content: string, similarity = 1, url = '/article') => ({
  title: 'Article',
  url,
  content,
  similarity,
});

it('ranks relevant chunks first and keeps complete code within the budget', () => {
  const best = document('Explanation\n```glsl\nvoid main() {}\n```', 0.9);
  const budget = contextTokenUpperBound([
    { title: best.title, url: best.url, content: best.content },
  ]);
  expect(selectContext([document('Less relevant', 0.1), best], budget)).toEqual(
    [{ title: best.title, url: best.url, content: best.content }]
  );
});

it('merges substantial overlapping excerpts from the same article', () => {
  const overlap = 'shared sentence '.repeat(10);
  const result = selectContext([
    document('Start\n' + overlap, 0.9),
    document(overlap + '\nEnd', 0.8),
    document('Start', 0.7),
  ]);
  expect(result).toEqual([
    {
      title: 'Article',
      url: '/article',
      content: 'Start\n' + overlap + '\nEnd',
    },
  ]);
});

it('preserves distinct sources and counts multibyte text conservatively', () => {
  const docs = [document('é'.repeat(200), 1), document('Small', 0.5, '/other')];
  const selected = selectContext(docs, 150);
  expect(selected.map((item) => item.url)).toEqual(['/other']);
  expect(contextTokenUpperBound(selected)).toBeLessThanOrEqual(150);
  expect(
    selectContext([document('Same', 1), document('Same', 0.9, '/other')])
  ).toHaveLength(2);
});

it('does not exceed the budget when merging overlapping chunks', () => {
  const shared = 'shared sentence '.repeat(10);
  const first = {
    title: 'Article',
    url: '/article',
    content: 'Start ' + shared.trim(),
  };
  const result = selectContext(
    [document(first.content), document(shared.trim() + ' End', 0.5)],
    contextTokenUpperBound([first])
  );
  expect(result).toEqual([first]);
});
