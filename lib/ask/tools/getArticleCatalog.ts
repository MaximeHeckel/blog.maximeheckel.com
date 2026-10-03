import { tool } from 'ai';
import { z } from 'zod';

import catalog from '../catalog.json';

export const createGetArticleCatalogTool = () =>
  tool({
    description:
      'Get the complete published article catalog, newest first, with titles, relative URLs, publication dates, and descriptions. Use for exact publication-year, date, count, newest/oldest, or article-list questions. No pagination or omitted entries. Descriptions are summaries, not evidence for detailed technical claims.',
    inputSchema: z.object({}),
    execute: async () => ({ articles: catalog }),
  });
