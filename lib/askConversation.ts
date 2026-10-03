import { z } from 'zod';

import { askAttachmentSchema } from './askAttachments';
import { askPageContextSchema } from './askPageContext';

export const askMessageSchema = z.discriminatedUnion('role', [
  z.object({
    id: z.string(),
    role: z.literal('user'),
    content: z.string(),
    attachments: z.array(askAttachmentSchema),
    pageContext: askPageContextSchema.optional(),
  }),
  z.object({
    id: z.string(),
    role: z.literal('assistant'),
    content: z.string(),
    sources: z.array(z.object({ title: z.string(), url: z.string() })),
  }),
]);

export type AskMessage = z.infer<typeof askMessageSchema>;

// Keep whole, recent turns. An oversized turn ends the contiguous context window.
export const boundAskHistory = (messages: AskMessage[]): AskMessage[] => {
  const result: AskMessage[] = [];
  let size = 0;

  for (let index = messages.length - 2; index >= 0; index -= 2) {
    const turn = messages.slice(index, index + 2);
    if (turn[0].role !== 'user' || turn[1].role !== 'assistant') break;

    const turnSize = JSON.stringify(turn).length;
    if (size + turnSize > 24000 || result.length >= 12) break;

    result.unshift(...turn);
    size += turnSize;
  }

  return result;
};
