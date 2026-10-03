import { tool } from 'ai';
import { z } from 'zod';

import { ArticleSearch, uniqueArticles } from '../articles';

export const createRecommendArticlesTool = (search: ArticleSearch) =>
  tool({
    description:
      'Find blog articles to recommend when the reader asks what to read, related articles, or a learning path. Returns distinct article titles and links, not evidence for technical claims. Form a specific query using the current article or conversation when relevant.',
    inputSchema: z.object({ query: z.string().trim().min(1).max(2000) }),
    execute: async ({ query }, { abortSignal }) => ({
      articles: uniqueArticles(
        await search(query, { count: 30, signal: abortSignal })
      ).slice(0, 5),
    }),
  });
