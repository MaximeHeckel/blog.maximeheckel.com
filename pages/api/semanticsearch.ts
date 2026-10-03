import { createOpenAI } from '@ai-sdk/openai';
import { ipAddress } from '@vercel/functions';
import { kv } from '@vercel/kv';
import { z } from 'zod';

import { streamAskAnswer } from '../../lib/ask/agent';
import { searchArticlePassages } from '../../lib/ask/articles';
import { askAttachmentSchema } from '../../lib/askAttachments';
import { askMessageSchema, boundAskHistory } from '../../lib/askConversation';
import { askPageContextSchema } from '../../lib/askPageContext';
import { OpenAIMockStream } from '../../lib/openAIStream';

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;

const openai = createOpenAI({
  apiKey: OPEN_AI_API_KEY,
});

const model = openai('gpt-6-luna');

export const config = {
  runtime: 'edge',
};

const allowedOrigins = [
  'http://localhost:3001',
  'https://blog.maximeheckel.com',
  'https://maximeheckel.com',
  'https://staging.maximeheckel.com',
  'https://r3f.maximeheckel.com',
];

export default async function handler(req: Request) {
  const origin = req.headers.get('Origin');

  // Helper function to create CORS headers
  const getCorsHeaders = (): Record<string, string> => {
    if (origin && allowedOrigins.includes(origin)) {
      return {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
    }
    return {};
  };

  if (req.method === 'OPTIONS') {
    if (origin && allowedOrigins.includes(origin)) {
      return new Response(null, {
        status: 200,
        headers: {
          ...getCorsHeaders(),
        },
      });
    } else {
      return new Response('Forbidden', { status: 403 });
    }
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...getCorsHeaders(), Allow: 'POST, OPTIONS' },
    });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', {
      status: 400,
      headers: getCorsHeaders(),
    });
  }

  const parsedRequest = z
    .object({
      query: z.string().trim().min(1),
      attachments: z.unknown().optional(),
      history: z.unknown().optional(),
      pageContext: z.unknown().optional(),
      mock: z.boolean().optional(),
      completion: z.boolean().optional(),
      threshold: z.number().min(0).max(1).optional(),
      count: z.number().int().min(1).max(100).optional(),
    })
    .safeParse(body);

  if (!parsedRequest.success) {
    return new Response('Invalid request', {
      status: 400,
      headers: getCorsHeaders(),
    });
  }

  const {
    query,
    attachments: rawAttachments = [],
    history: rawHistory = [],
    pageContext: rawPageContext,
    mock,
    completion = true,
    threshold = 0.25,
    count = 20,
  } = parsedRequest.data;

  const parsedAttachments = z
    .array(askAttachmentSchema)
    .safeParse(rawAttachments);
  if (!parsedAttachments.success) {
    return new Response('Invalid attachments', {
      status: 400,
      headers: getCorsHeaders(),
    });
  }
  const parsedHistory = z.array(askMessageSchema).safeParse(rawHistory);
  if (!parsedHistory.success) {
    return new Response('Invalid history', {
      status: 400,
      headers: getCorsHeaders(),
    });
  }
  const parsedPageContext = askPageContextSchema
    .optional()
    .safeParse(rawPageContext);
  if (!parsedPageContext.success)
    return new Response('Invalid page context', {
      status: 400,
      headers: getCorsHeaders(),
    });
  const pageContext = parsedPageContext.data;
  const history = boundAskHistory(parsedHistory.data);
  const attachments = parsedAttachments.data;
  const input = [
    // Recent conversational context gives referential follow-ups a retrieval topic.
    ...history.slice(-4).map((message) => JSON.stringify(message)),
    query,
    ...attachments.map((attachment) =>
      attachment.kind === 'code' ? attachment.code : attachment.text
    ),
  ]
    .join(' ')
    .replace(/\n/g, ' ');

  if (mock) {
    try {
      const stream = await OpenAIMockStream();
      const response = stream.toTextStreamResponse();

      // Add CORS headers to the stream response
      const corsHeaders = getCorsHeaders();
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      return new Response(`An error occurred: ${error}`, {
        status: 500,
        headers: getCorsHeaders(),
      });
    }
  }

  if (
    !SUPABASE_API_KEY ||
    !SUPABASE_URL ||
    !OPEN_AI_API_KEY ||
    !OPENAI_EMBEDDING_MODEL
  ) {
    return new Response('Missing environment', {
      status: 500,
      headers: getCorsHeaders(),
    });
  }

  const MAX_REQUEST_PER_MINUTE_PER_USER = 15; // number of requests per minute per user
  const MIN_RATE_LIMIT_INTERVAL = 60; // cache expiration time
  const ip = ipAddress(req) || 'localhost';

  const rate: number | null = await kv.get(ip);

  if (!mock) {
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
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded: ${error}` }),
        {
          status: 429,
          headers: {
            ...getCorsHeaders(),
            'X-RateLimit-Limit': `${MAX_REQUEST_PER_MINUTE_PER_USER}`,
            'X-RateMAX_REQUEST_PER_MINUTE_PER_USER-Remaining': `${
              MAX_REQUEST_PER_MINUTE_PER_USER - (rate || 0)
            }`,
          },
        }
      );
    }
  }

  try {
    if (!completion) {
      const passages = await searchArticlePassages(input, {
        threshold,
        count,
        signal: req.signal,
      });
      return Response.json(
        passages.filter(
          (passage, index) =>
            passages.findIndex((other) => other.url === passage.url) === index
        ),
        {
          headers: getCorsHeaders(),
        }
      );
    }
    const response = await streamAskAnswer({
      model,
      query,
      attachments,
      history,
      pageContext,
      signal: req.signal,
    });
    Object.entries(getCorsHeaders()).forEach(([key, value]) =>
      response.headers.set(key, value)
    );
    return response;
  } catch {
    return new Response('Unable to answer right now', {
      status: 502,
      headers: getCorsHeaders(),
    });
  }
}
