import { z } from 'zod';

const attachmentMetadata = {
  id: z.string(),
  title: z.string().optional(),
  sourceUrl: z.string().optional(),
};

export const askAttachmentSchema = z.discriminatedUnion('kind', [
  z.object({
    ...attachmentMetadata,
    kind: z.literal('code'),
    code: z.string(),
    language: z.string(),
  }),
  z.object({
    ...attachmentMetadata,
    kind: z.literal('selection'),
    text: z.string(),
  }),
]);

export type AskAttachment = z.infer<typeof askAttachmentSchema>;
