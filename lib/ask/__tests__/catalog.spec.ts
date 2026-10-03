// @vitest-environment node
import path from 'node:path';

import { expect, it } from 'vitest';

import { buildStaticArticleCatalog } from '../../../scripts/generate-article-catalog.js';
import catalog from '../catalog.json';

it('ships the full current article metadata, sorted newest first, without article bodies', () => {
  const expected = buildStaticArticleCatalog(
    path.join(process.cwd(), 'content')
  );

  expect(catalog).toEqual(expected);
  expect(catalog.length).toBeGreaterThan(0);

  for (const article of catalog) {
    expect(Object.keys(article).sort()).toEqual([
      'description',
      'publishedAt',
      'title',
      'url',
    ]);
    expect(article.url).toMatch(/^\/posts\/[^/]+\/$/);
    expect(Number.isNaN(Date.parse(article.publishedAt))).toBe(false);
  }
});
