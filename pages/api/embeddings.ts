import { ipAddress } from '@vercel/edge';
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;

const MAX_REQUEST_PER_MINUTE_PER_USER = 8; // number of requests per minute per user
const MIN_RATE_LIMIT_INTERVAL = 60; // cache expiration time ins econd

export default async function handler(req: Request) {
  const { query } = (await req.json()) as {
    query: string;
  };

  const input = query.replace(/\n/g, ' ');
  if (input === '') return;

  if (!OPEN_AI_API_KEY || !OPENAI_EMBEDDING_MODEL) {
    return new Response('Missing environment', { status: 500 });
  }

  const ip = ipAddress(req) || '127.0.0.1';

  const rate: number | null = await kv.get(ip);

  try {
    if (!rate) {
      await kv.set(ip, 0, { ex: MIN_RATE_LIMIT_INTERVAL, nx: true });
      await kv.incr(ip);
    } else {
      if (rate > MAX_REQUEST_PER_MINUTE_PER_USER) {
        throw new Error('Rate limit exceeded');
      }

      await kv.incr(ip);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'X-RateLimit-Limit': `${MAX_REQUEST_PER_MINUTE_PER_USER}`,
        'X-RateMAX_REQUEST_PER_MINUTE_PER_USER-Remaining': `${
          MAX_REQUEST_PER_MINUTE_PER_USER - (rate || 0)
        }`,
      },
    });
  }

  const embeddingResponse = await fetch(
    'https://api.openai.com/v1/embeddings',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_EMBEDDING_MODEL,
        input,
      }),
    }
  );

  const {
    data: [{ embedding }],
  } = await embeddingResponse.json();

  return new Response(JSON.stringify(embedding));
}
