import { tool } from 'ai';
import { z } from 'zod';

import type { ArticleSearch } from '../articles';

export const createRetrievePassagesTool = (search: ArticleSearch) =>
  tool({
    description:
      'Retrieve evidence from blog articles to answer technical or article-specific questions. Use a self-contained query informed by the conversation. Do not use search results to infer which page the reader is on: pageContext identifies that explicitly.',
    inputSchema: z.object({ query: z.string().trim().min(1).max(2000) }),
    execute: async ({ query }, { abortSignal }) => {
      const passages = await search(query, { count: 12, signal: abortSignal });
      return {
        passages: passages.slice(0, 8).map((passage) => ({
          ...passage,
          content: passage.content.slice(0, 3000),
        })),
      };
    },
  });
