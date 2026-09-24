import { z } from 'zod';

export const searchResponseSchema = z.array(
  z.object({
    title: z.string().trim().min(1),
    path: z.string().regex(/^\/posts\/[^/?#]+\/$/),
    date: z.iso.datetime({ offset: true }),
  })
);
