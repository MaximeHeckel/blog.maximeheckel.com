import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const passageSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  similarity: z.number().optional(),
});
export type ArticlePassage = z.infer<typeof passageSchema>;
export interface ArticleSearchOptions {
  threshold?: number;
  count?: number;
  signal?: AbortSignal;
}
export type ArticleSearch = (
  query: string,
  options?: ArticleSearchOptions
) => Promise<ArticlePassage[]>;

// Shared by legacy semantic search and both agent tools. No model/UI dependencies.
export const searchArticlePassages: ArticleSearch = async (
  query,
  options = {}
) => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBEDDING_MODEL,
      input: query,
    }),
    signal: options.signal,
  });
  if (!response.ok) throw new Error('Article search embedding failed');
  const { data } = z
    .object({
      data: z.array(z.object({ embedding: z.array(z.number()) })).min(1),
    })
    .parse(await response.json());
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_API_KEY!
  );
  const request = client.rpc('match_documents_2', {
    query_embedding: data[0].embedding,
    similarity_threshold: options.threshold ?? 0.25,
    match_count: options.count ?? 20,
  });
  const { data: documents, error } = await (options.signal
    ? request.abortSignal(options.signal)
    : request);
  if (error) throw new Error('Article search failed');
  return z
    .array(passageSchema)
    .parse(documents ?? [])
    .map((document) => ({ ...document, content: document.content.trim() }));
};

export const uniqueArticles = (passages: ArticlePassage[]) => {
  const seen = new Set<string>();
  return passages
    .filter(({ url }) => {
      const key = url.split('#')[0].replace(/\/$/, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ title, url }) => ({ title, url }));
};
