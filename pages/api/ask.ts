import { once } from 'events';

import { createOpenAI } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { selectAskArticles } from '../../lib/askArticles';
import { askPrompt } from '../../lib/askPrompt';
import { OpenAIMockStream } from '../../lib/openAIStream';

const querySchema = z.object({
  query: z.string().trim().min(1).max(2000),
  mock: z.boolean().optional(),
});

export const config = { maxDuration: 120 };

// Node runtime: selected articles are read directly from the repository.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Next.js compression buffers small text chunks until the answer finishes.
  res.setHeader('Cache-Control', 'no-store, no-transform');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const input = querySchema.safeParse(req.body);
  if (!input.success) {
    return res
      .status(400)
      .json({ error: 'Provide a query of 1–2000 characters' });
  }

  const controller = new AbortController();
  const onClose = () => {
    if (!res.writableEnded) controller.abort();
  };
  res.on('close', onClose);

  const write = async (chunk: string | Uint8Array) => {
    if (controller.signal.aborted) return;
    if (!res.write(chunk)) {
      await once(res, 'drain', { signal: controller.signal });
    }
  };

  try {
    if (input.data.mock && process.env.NODE_ENV !== 'production') {
      const mock = await OpenAIMockStream();
      const reader = mock.toTextStreamResponse().body!.getReader();
      const cancel = () => {
        void reader.cancel();
      };
      controller.signal.addEventListener('abort', cancel, { once: true });
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      try {
        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          await write(value);
        }
      } finally {
        controller.signal.removeEventListener('abort', cancel);
        reader.releaseLock();
      }
    } else {
      const jevKey = process.env.JEV_API_KEY;
      const openaiKey = process.env.OPEN_AI_API_KEY;
      if (!jevKey || !openaiKey) {
        return res
          .status(500)
          .json({ error: 'Missing JEV_API_KEY or OPEN_AI_API_KEY' });
      }

      const articles = await selectAskArticles(
        input.data.query,
        jevKey,
        controller.signal
      );
      if (controller.signal.aborted) return;
      if (!articles.length) {
        return res.status(200).json({
          answer:
            "I couldn't find an article that clearly addresses that question. Try naming the technique or topic you're interested in.",
          sources: [],
        });
      }

      const openai = createOpenAI({ apiKey: openaiKey });
      const result = streamObject({
        model: openai('gpt-6-luna'),
        system: askPrompt,
        providerOptions: { openai: { reasoningEffort: 'low' } },
        abortSignal: controller.signal,
        schema: z.object({
          answer: z
            .string()
            .describe(
              'A direct Markdown answer with a useful code example for technical questions.'
            ),
          sources: z
            .array(z.object({ title: z.string(), url: z.string() }))
            .describe(
              'Only articles supporting the answer; copy their titles and URLs exactly and deduplicate by URL.'
            ),
        }),
        messages: [
          {
            role: 'user',
            content: JSON.stringify({ question: input.data.query, articles }),
          },
        ],
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      for await (const chunk of result.textStream) {
        if (controller.signal.aborted) return;
        await write(chunk);
      }
    }
    if (!controller.signal.aborted) res.end();
  } catch {
    if (!controller.signal.aborted) {
      if (res.headersSent) res.destroy(new Error('Ask response interrupted'));
      else res.status(502).json({ error: 'Unable to answer the question' });
    }
  } finally {
    res.off('close', onClose);
  }
}
