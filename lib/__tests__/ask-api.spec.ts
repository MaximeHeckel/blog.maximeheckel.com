// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ rpc }) }));
vi.mock('@vercel/functions', () => ({ ipAddress: () => 'test-client' }));
vi.mock('@vercel/kv', () => ({
  kv: { get: async () => null, set: async () => null, incr: async () => 1 },
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('sends Luna with low reasoning and streams the existing answer contract', async () => {
  vi.stubEnv('SUPABASE_API_KEY', 'test');
  vi.stubEnv('SUPABASE_URL', 'https://example.test');
  vi.stubEnv('OPEN_AI_API_KEY', 'test');
  vi.stubEnv('OPENAI_EMBEDDING_MODEL', 'test-embedding');
  const excerpt = {
    title: 'CSS composition',
    url: '/posts/css-composition/',
    content: '  Compose CSS custom properties with var().  ',
  };
  rpc.mockResolvedValue({ data: [excerpt], error: null });
  const answer = {
    answer: 'Compose CSS custom properties with `var()`.',
    sources: [{ title: excerpt.title, url: excerpt.url }],
  };
  const events = [
    {
      type: 'response.created',
      response: { id: 'response-test', created_at: 0, model: 'gpt-6-luna' },
    },
    {
      type: 'response.output_item.added',
      output_index: 0,
      item: { type: 'message', id: 'message-test' },
    },
    {
      type: 'response.output_text.delta',
      item_id: 'message-test',
      delta: JSON.stringify(answer),
    },
    {
      type: 'response.completed',
      response: { usage: { input_tokens: 100, output_tokens: 20 } },
    },
  ];
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (url) => {
    if (String(url).endsWith('/embeddings')) {
      return Response.json({ data: [{ embedding: [0.1] }] });
    }
    if (String(url).endsWith('/responses')) {
      return new Response(
        events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''),
        {
          headers: { 'Content-Type': 'text/event-stream' },
        }
      );
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  const { default: handler } = await import('../../pages/api/semanticsearch');
  const response = await handler(
    new Request('https://example.test/api/semanticsearch', {
      method: 'POST',
      body: JSON.stringify({ query: 'How do I compose CSS variables?' }),
    })
  );
  expect(response.status).toBe(200);
  expect(JSON.parse(await response.text())).toEqual(answer);
  const request = fetchMock.mock.calls.find(([url]) =>
    String(url).endsWith('/responses')
  );
  expect(request).toBeDefined();
  const body = JSON.parse(request![1]!.body as string);
  expect(body.model).toBe('gpt-6-luna');
  expect(body.reasoning).toEqual({ effort: 'low' });
  expect(body.stream).toBe(true);
  expect(body.text.format.type).toBe('json_schema');
  expect(body.text.format.schema.required).toEqual(['answer', 'sources']);
  const userMessage = body.input.find(
    (message: { role: string }) => message.role === 'user'
  );
  expect(JSON.parse(userMessage.content[0].text)).toEqual({
    question: 'How do I compose CSS variables?',
    excerpts: [{ ...excerpt, content: excerpt.content.trim() }],
  });
});
