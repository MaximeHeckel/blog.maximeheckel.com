import path from 'path';

import { readdir, readFile } from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const { slug } = req.query;
  if (typeof slug !== 'string') return res.status(404).end();

  try {
    const directory = path.join(process.cwd(), 'content');
    const files = await readdir(directory);
    // Only serve articles in the catalog; never resolve arbitrary input paths.
    if (!files.includes(`${slug}.mdx`)) return res.status(404).end();

    const markdown = await readFile(
      path.join(directory, `${slug}.mdx`),
      'utf8'
    );
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(markdown);
  } catch (_error) {
    return res.status(500).end();
  }
}
