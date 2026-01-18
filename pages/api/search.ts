import fs from 'fs';
import path from 'path';

import { create, load, Orama, search } from '@orama/orama';

export const config = {
  runtime: 'nodejs',
};

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

const EMBEDDING_DIMENSIONS = 512;

type SearchSchema = {
  slug: 'string';
  title: 'string';
  section: 'string';
  heading: 'string';
  embedding: 'vector[512]';
};

let db: Orama<SearchSchema> | null = null;
let dbPromise: Promise<Orama<SearchSchema>> | null = null;

async function getDatabase(): Promise<Orama<SearchSchema>> {
  if (db) return db;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const indexPath = path.join(
      process.cwd(),
      'public/static/search-index.json'
    );
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

    const database = await create<SearchSchema>({
      schema: {
        slug: 'string',
        title: 'string',
        section: 'string',
        heading: 'string',
        embedding: `vector[${EMBEDDING_DIMENSIONS}]`,
      },
    });

    await load(database, data);
    db = database;
    return database;
  })();

  return dbPromise;
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text.replace(/\n/g, ' '),
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

export default async function handler(
  req: { method: string; body: { query: string } },
  res: {
    status: (code: number) => {
      json: (data: unknown) => void;
      end: (msg?: string) => void;
    };
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query' });
  }

  if (!OPEN_AI_API_KEY) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  const input = query.replace(/\n/g, ' ');
  if (input === '') {
    return res.status(400).json({ error: 'Empty query' });
  }

  try {
    const embedding = await getEmbedding(input);
    const database = await getDatabase();

    const results = await search(database, {
      mode: 'hybrid',
      term: input,
      vector: {
        value: embedding,
        property: 'embedding',
      },

      limit: 50,
      similarity: 0.5,
    });

    const seenSlugs = new Set<string>();
    const uniqueHits = results.hits.filter((hit) => {
      if (seenSlugs.has(hit.document.slug)) {
        return false;
      }
      seenSlugs.add(hit.document.slug);
      return true;
    });

    const formattedHits = uniqueHits.map((hit) => ({
      title: hit.document.title,
      url: `https://blog.maximeheckel.com/posts/${hit.document.slug}`,
      score: hit.score,
    }));

    return res.status(200).json(formattedHits);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}
