// @vitest-environment node
import { readFile } from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';
import { expect, it, vi } from 'vitest';

import handler from '../../pages/api/posts/[slug]';

function createResponse() {
  const response = {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return {
    response,
    res: response as unknown as NextApiResponse,
  };
}

it('serves the original article source with a Markdown content type', async () => {
  const { response, res } = createResponse();
  await handler(
    {
      method: 'GET',
      query: { slug: 'learning-in-public' },
    } as unknown as NextApiRequest,
    res
  );

  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.setHeader).toHaveBeenCalledWith(
    'Content-Type',
    'text/markdown; charset=utf-8'
  );
  expect(response.send).toHaveBeenCalledWith(
    await readFile('content/learning-in-public.mdx', 'utf8')
  );
});

it('returns Markdown headers without a body for HEAD requests', async () => {
  const { response, res } = createResponse();
  await handler(
    {
      method: 'HEAD',
      query: { slug: 'learning-in-public' },
    } as unknown as NextApiRequest,
    res
  );
  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.setHeader).toHaveBeenCalledWith(
    'Content-Type',
    'text/markdown; charset=utf-8'
  );
  expect(response.send).not.toHaveBeenCalled();
  expect(response.end).toHaveBeenCalled();
});

it.each([
  'unknown-article',
  '../package.json',
  ['learning-in-public'],
  undefined,
])('rejects unknown or invalid article slugs: %s', async (slug) => {
  const { response, res } = createResponse();
  await handler(
    { method: 'GET', query: { slug } } as unknown as NextApiRequest,
    res
  );
  expect(response.status).toHaveBeenCalledWith(404);
  expect(response.send).not.toHaveBeenCalled();
});

it('rejects unsupported methods', async () => {
  const { response, res } = createResponse();
  await handler(
    {
      method: 'POST',
      query: { slug: 'learning-in-public' },
    } as unknown as NextApiRequest,
    res
  );
  expect(response.status).toHaveBeenCalledWith(405);
  expect(response.setHeader).toHaveBeenCalledWith('Allow', 'GET, HEAD');
  expect(response.send).not.toHaveBeenCalled();
});
