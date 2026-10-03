import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

// Match the home page's article set without bundling MDX or Node APIs into Edge.
export function buildStaticArticleCatalog(directory) {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const { data } = matter(readFileSync(path.join(directory, file), 'utf8'));

      if (
        typeof data.slug !== 'string' ||
        typeof data.title !== 'string' ||
        typeof data.date !== 'string'
      ) {
        throw new Error(`Missing article metadata: ${file}`);
      }

      return {
        title: data.title,
        url: `/posts/${data.slug}/`,
        publishedAt: data.date,
        description: typeof data.subtitle === 'string' ? data.subtitle : '',
      };
    })
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) || a.url.localeCompare(b.url)
    );
}

export function generateArticleCatalog(root) {
  const catalog = buildStaticArticleCatalog(path.join(root, 'content'));
  const output = path.join(root, 'lib/ask/catalog.json');
  const serialized = `${JSON.stringify(catalog, null, 2)}\n`;

  let previous;

  try {
    previous = readFileSync(output, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (previous !== serialized) writeFileSync(output, serialized);
}
