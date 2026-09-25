// @vitest-environment node
import { Writable } from 'stream';

import type { NextApiRequest, NextApiResponse } from 'next';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import handler from '../../pages/api/ask';

const { select } = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock('../askArticles', () => ({ selectAskArticles: select }));

class ResponseRecorder extends Writable {
  statusCode = 200;
  headersSent = false;
  headers = new Map<string, string>();
  chunks: string[] = [];
  _write(chunk: Buffer, _encoding: BufferEncoding, callback: () => void) {
    this.headersSent = true;
    this.chunks.push(chunk.toString());
    callback();
  }
  setHeader(key: string, value: string) {
    this.headers.set(key, value);
  }
  status(code: number) {
    this.statusCode = code;
    return this;
  }
  json(body: unknown) {
    this.end(JSON.stringify(body));
    return this;
  }
}
const call = async (body: unknown, method = 'POST') => {
  const res = new ResponseRecorder();
  await handler(
    { method, body } as NextApiRequest,
    res as unknown as NextApiResponse
  );
  return res;
};
beforeEach(() => {
  vi.stubEnv('JEV_API_KEY', 'test');
  vi.stubEnv('OPEN_AI_API_KEY', 'test');
  select.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it('streams Luna output with full article context and no embedding requests', async () => {
  const articles = [
    {
      title: 'Article',
      url: '/posts/article/',
      content: 'Start\n```glsl\nvoid main() {}\n```\nEnd',
    },
  ];
  select.mockResolvedValue(articles);
  const answer = {
    answer: 'An explanation',
    sources: [{ title: 'Article', url: '/posts/article/' }],
  };
  const events = [
    {
      type: 'response.created',
      response: { id: 'test', created_at: 0, model: 'gpt-6-luna' },
    },
    {
      type: 'response.output_item.added',
      output_index: 0,
      item: { type: 'message', id: 'msg' },
    },
    {
      type: 'response.output_text.delta',
      item_id: 'msg',
      delta: JSON.stringify(answer),
    },
    {
      type: 'response.completed',
      response: { usage: { input_tokens: 100, output_tokens: 20 } },
    },
  ];
  const fetchMock = vi.fn<typeof fetch>(async (url) => {
    expect(String(url)).toBe('https://api.openai.com/v1/responses');
    return new Response(
      events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''),
      { headers: { 'Content-Type': 'text/event-stream' } }
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  const res = await call({ query: '  Explain shaders  ' });
  expect(res.statusCode).toBe(200);
  expect(res.headers.get('Cache-Control')).toBe('no-store, no-transform');
  expect(JSON.parse(res.chunks.join(''))).toEqual(answer);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
  expect(body.model).toBe('gpt-6-luna');
  expect(body.reasoning).toEqual({ effort: 'low' });
  expect(body.stream).toBe(true);
  const message = body.input.find(
    (entry: { role: string }) => entry.role === 'user'
  );
  expect(JSON.parse(message.content[0].text)).toEqual({
    question: 'Explain shaders',
    articles,
  });
});

it('returns a no-match answer without calling Luna', async () => {
  select.mockResolvedValue([]);
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const res = await call({ query: 'Unrelated' });
  expect(res.statusCode).toBe(200);
  expect(JSON.parse(res.chunks.join('')).sources).toEqual([]);
  expect(fetchMock).not.toHaveBeenCalled();
});

it('rejects invalid requests before selecting articles', async () => {
  expect((await call({}, 'GET')).statusCode).toBe(405);
  expect((await call({ query: ' ' })).statusCode).toBe(400);
  expect((await call({ query: 'x'.repeat(2001) })).statusCode).toBe(400);
  expect(select).not.toHaveBeenCalled();
});

it('reports a Jev failure without falling back to semantic search', async () => {
  select.mockRejectedValue(new Error('Jev unavailable'));
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const res = await call({ query: 'Shaders' });
  expect(res.statusCode).toBe(502);
  expect(fetchMock).not.toHaveBeenCalled();
});

it('cancels article selection when the client disconnects', async () => {
  const res = new ResponseRecorder();
  let signal!: AbortSignal;
  select.mockImplementation((_query, _key, suppliedSignal: AbortSignal) => {
    signal = suppliedSignal;
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('Aborted')), {
        once: true,
      });
    });
  });
  const pending = handler(
    { method: 'POST', body: { query: 'Shaders' } } as NextApiRequest,
    res as unknown as NextApiResponse
  );
  res.emit('close');
  await pending;
  expect(signal.aborted).toBe(true);
  expect(res.chunks).toEqual([]);
});
