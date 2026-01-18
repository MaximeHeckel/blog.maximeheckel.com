/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

import { create, insert, load, remove, save, search } from '@orama/orama';
import chalk from 'chalk';
import 'dotenv/config';
import ProgressBar from 'progress';

import processMdxFile from './process-mdx.js';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const OUTPUT_PATH = path.join(process.cwd(), 'public/static/search-index.json');

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

// Use 512 dimensions instead of 1536 to reduce index size (~3x smaller)
const EMBEDDING_DIMENSIONS = 512;

async function getEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

async function createDatabase() {
  return create({
    schema: {
      slug: 'string',
      title: 'string',
      section: 'string',
      heading: 'string',
      embedding: `vector[${EMBEDDING_DIMENSIONS}]`,
    },
  });
}

async function loadExistingIndex() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    const db = await createDatabase();
    await load(db, data);
    return db;
  } catch (error) {
    console.log(
      chalk.yellow('Could not load existing index, creating new one', error)
    );
    return null;
  }
}

async function removeDocumentsBySlug(db, slug) {
  // Search for all documents with this slug
  const results = await search(db, {
    term: slug,
    properties: ['slug'],
    limit: 1000,
  });

  // Remove each matching document
  for (const hit of results.hits) {
    if (hit.document.slug === slug) {
      await remove(db, hit.id);
    }
  }

  return results.hits.filter((h) => h.document.slug === slug).length;
}

async function indexFile(db, filePath) {
  const { metadata, chunks } = await processMdxFile(filePath);

  if (!metadata.title || !metadata.slug) {
    console.log(chalk.yellow(`  Skipping - missing title or slug`));
    return 0;
  }

  console.log(
    chalk.cyan(`  ${metadata.title}`),
    chalk.gray(`(${chunks.length} chunks)`)
  );

  const progress = new ProgressBar('    [:bar] :current/:total', {
    total: chunks.length,
    width: 30,
    complete: '█',
    incomplete: '░',
  });

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.text);

    await insert(db, {
      slug: metadata.slug,
      title: metadata.title,
      section: chunk.section || '',
      heading: chunk.heading || '',
      embedding,
    });

    progress.tick();
  }

  console.log('');
  return chunks.length;
}

async function saveIndex(db, stats) {
  const serialized = await save(db);

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(serialized));

  const fileStats = fs.statSync(OUTPUT_PATH);
  const sizeMB = (fileStats.size / 1024 / 1024).toFixed(2);

  console.log(chalk.green(`\n✓ Search index generated!`));
  if (stats.posts) {
    console.log(chalk.gray(`  Posts: ${stats.posts}`));
  }
  console.log(chalk.gray(`  Chunks indexed: ${stats.chunks}`));
  console.log(chalk.gray(`  Size: ${sizeMB}MB`));
  console.log(chalk.gray(`  Output: ${OUTPUT_PATH}`));
  console.log(chalk.yellow(`\nRemember to commit this file!`));
}

async function indexSingleFile(filePath) {
  console.log(chalk.cyan(`Indexing single file: ${filePath}\n`));

  // Load existing index or create new one
  let db = await loadExistingIndex();
  if (!db) {
    console.log(chalk.yellow('No existing index found, creating new one'));
    db = await createDatabase();
  }

  // Get the slug from the file to remove old entries
  const { metadata } = await processMdxFile(filePath);
  if (metadata.slug) {
    const removed = await removeDocumentsBySlug(db, metadata.slug);
    if (removed > 0) {
      console.log(
        chalk.gray(`  Removed ${removed} existing chunks for ${metadata.slug}`)
      );
    }
  }

  // Index the file
  const chunks = await indexFile(db, filePath);

  // Save
  await saveIndex(db, { chunks });
}

async function indexAllFiles() {
  console.log(chalk.cyan('Generating search index with chunk embeddings...\n'));

  const db = await createDatabase();
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  console.log(chalk.cyan(`Processing ${files.length} posts...\n`));

  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);

    try {
      const chunks = await indexFile(db, filePath);
      totalChunks += chunks;
    } catch (error) {
      console.error(chalk.red(`  Error processing ${file}:`), error.message);
    }
  }

  await saveIndex(db, { posts: files.length, chunks: totalChunks });
}

async function main() {
  if (!OPEN_AI_API_KEY) {
    console.error(chalk.red('Missing OPEN_AI_API_KEY environment variable'));
    process.exit(1);
  }

  const targetPath = process.argv[2];

  if (targetPath) {
    // Single file mode
    const resolvedPath = path.resolve(targetPath);

    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`File not found: ${resolvedPath}`));
      process.exit(1);
    }

    if (!resolvedPath.endsWith('.mdx')) {
      console.error(chalk.red('File must be an .mdx file'));
      process.exit(1);
    }

    await indexSingleFile(resolvedPath);
  } else {
    // Full index mode
    await indexAllFiles();
  }
}

main().catch(console.error);
