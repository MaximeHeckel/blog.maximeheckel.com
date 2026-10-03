import { generateText, stepCountIs, streamObject } from 'ai';
import type { LanguageModel, ModelMessage } from 'ai';
import { z } from 'zod';

import type { AskAttachment } from '../askAttachments';
import type { AskMessage } from '../askConversation';
import type { AskPageContext } from '../askPageContext';
import { askPrompt } from './prompt';
import { createAskTools } from './tools';

interface AskAnswerOptions {
  model: LanguageModel;
  query: string;
  attachments: AskAttachment[];
  history: AskMessage[];
  pageContext?: AskPageContext;
  signal: AbortSignal;
}

export const streamAskAnswer = async ({
  model,
  query,
  attachments,
  history,
  pageContext,
  signal,
}: AskAnswerOptions) => {
  const messages: ModelMessage[] = [
    ...history.map(
      (message): ModelMessage => ({
        role: message.role,
        content:
          message.role === 'user'
            ? JSON.stringify({
                question: message.content,
                attachments: message.attachments,
                pageContext: message.pageContext ?? null,
              })
            : message.content,
      })
    ),
    {
      role: 'user',
      content: JSON.stringify({
        question: query,
        attachments,
        pageContext: pageContext ?? null,
      }),
    },
  ];

  // Keep tool planning separate from the JSON answer stream consumed by existing clients.
  // Intermediate tool-step text must never leak into that stream.
  const evidence = await generateText({
    model,
    system: `${askPrompt}\nYou are selecting evidence for the answer. Use retrievePassages for blog-specific evidence and recommendArticles for reading suggestions. Skip tools when the supplied page context, attachments, or general knowledge suffice. Use the current article's title and topic when recommending related reading. Do not draft the answer; finish once you have enough evidence.`,
    messages,
    tools: createAskTools(),
    stopWhen: stepCountIs(2),
    abortSignal: signal,
    maxRetries: 0,
    providerOptions: {
      openai: { reasoningEffort: 'low', parallelToolCalls: false },
    },
  });
  signal.throwIfAborted();
  const toolResults = evidence.steps.flatMap((step) =>
    step.toolResults.map((result) => ({
      tool: result.toolName,
      result: result.output,
    }))
  );
  const result = streamObject({
    model,
    system: askPrompt,
    messages: [
      ...messages.slice(0, -1),
      {
        role: 'user',
        content: JSON.stringify({
          question: query,
          attachments,
          pageContext: pageContext ?? null,
          toolResults,
        }),
      },
    ],
    abortSignal: signal,
    maxRetries: 0,
    providerOptions: { openai: { reasoningEffort: 'low' } },
    schema: z.object({
      answer: z
        .string()
        .describe(
          'The answer in Markdown, with real article links for reading recommendations.'
        ),
      sources: z
        .array(z.object({ title: z.string(), url: z.string() }))
        .describe(
          'Only supporting sources from tool results or current page context. Never invent sources.'
        ),
    }),
  });
  return result.toTextStreamResponse();
};
