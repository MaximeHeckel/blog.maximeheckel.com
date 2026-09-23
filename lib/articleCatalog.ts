import path from 'path';

import { readdir, readFile } from 'fs/promises';
import matter from 'gray-matter';

export function extractArticleHeadings(content: string): string[] {
  const headings: string[] = [];
  let fence: { marker: string; length: number } | undefined;

  for (const line of content.split(/\r?\n/)) {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (
        delimiter &&
        delimiter[1][0] === fence.marker &&
        delimiter[1].length >= fence.length &&
        !delimiter[2].trim()
      ) {
        fence = undefined;
      }
      continue;
    }
    if (delimiter) {
      fence = { marker: delimiter[1][0], length: delimiter[1].length };
      continue;
    }

    const heading = line.match(/^ {0,3}#{1,6}\s+(.+?)\s*$/);
    if (heading) headings.push(heading[1].replace(/\s+#+\s*$/, ''));
  }

  return headings;
}

// Intentionally rebuilt per request during the relevance experiment.
export async function buildArticleCatalog() {
  const directory = path.join(process.cwd(), 'content');
  const files = (await readdir(directory))
    .filter((file) => file.endsWith('.mdx'))
    .sort();

  return Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(
        await readFile(path.join(directory, file), 'utf8')
      );
      if (typeof data.slug !== 'string' || typeof data.title !== 'string') {
        throw new Error(`Missing article metadata: ${file}`);
      }

      return {
        id: data.slug,
        title: data.title,
        subtitle: typeof data.subtitle === 'string' ? data.subtitle : '',
        headings: extractArticleHeadings(content),
        path: `/posts/${data.slug}/`,
      };
    })
  );
}
