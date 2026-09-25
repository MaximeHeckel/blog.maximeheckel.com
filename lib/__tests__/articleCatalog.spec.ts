// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';

import { buildArticleCatalog, readArticleLibrary } from '../articleCatalog';

const { readdir, readFile } = vi.hoisted(() => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({ readdir, readFile }));

const content =
  '\nOpening paragraph.\n\n## Implementation\n\n```glsl\nvoid main() {}\n```\n';
const metadata = {
  id: 'shader',
  title: 'Shader article',
  date: '2026-01-01',
  subtitle: '',
  headings: ['Implementation'],
  path: '/posts/shader/',
};

beforeEach(() => {
  vi.resetAllMocks();
  readdir.mockResolvedValue(['shader.mdx', 'ignored.txt']);
  readFile.mockResolvedValue(
    `---\nslug: shader\ntitle: Shader article\ndate: '2026-01-01'\n---\n${content}`
  );
});

it('loads complete article bodies alongside validated metadata', async () => {
  expect(await readArticleLibrary()).toEqual([{ ...metadata, content }]);
  expect(readFile).toHaveBeenCalledTimes(1);
});

it('keeps full article bodies out of the search catalog', async () => {
  expect(await buildArticleCatalog()).toEqual([metadata]);
});

it('rejects articles with missing required metadata', async () => {
  readFile.mockResolvedValue('---\ntitle: Missing slug\n---\nContent');
  await expect(readArticleLibrary()).rejects.toThrow(
    'Missing article metadata: shader.mdx'
  );
});
