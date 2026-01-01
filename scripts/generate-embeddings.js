import fs from 'fs';
import path from 'path';

import 'dotenv/config';
import { fileURLToPath } from 'url';

/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import ProgressBar from 'progress';

import processMdxFile from './process-mdx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY_BYPASS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const BLOG_URL = process.env.BLOG_URL;
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;

/**
 * EMBEDDING MODEL RECOMMENDATION (2024/2025):
 *
 * If currently using 'text-embedding-ada-002', consider upgrading to 'text-embedding-3-small':
 *
 * Benefits:
 * - 62% cost reduction ($0.020 vs $0.100 per 1M tokens)
 * - Better performance (higher accuracy on benchmarks)
 * - Smaller dimensions option (512 or 256 vs 1536) for additional cost savings
 * - More efficient storage and faster similarity searches
 *
 * To upgrade:
 * 1. Set OPENAI_EMBEDDING_MODEL=text-embedding-3-small in your .env
 * 2. Optionally add dimensions parameter to embeddings.create() for smaller vectors
 * 3. Re-run embedding generation for all content
 * 4. Update Supabase schema if changing dimensions (current: 1536)
 *
 * Alternative: 'text-embedding-3-large' for highest quality (more expensive)
 */

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const generateEmbeddings = async (chunks, metadata) => {
  if (!metadata.title) return;

  console.info(
    chalk.cyan('info'),
    ` - Generating Embeddings for ${metadata.title}`
  );

  const url = `${BLOG_URL}/posts/${metadata.slug}`;

  const existingDocs = await supabaseClient
    .from('documents')
    .select('url')
    .eq('url', url);

  if (existingDocs.data.length > 0) {
    console.warn(
      chalk.yellow('warn'),
      ` - Found existing documents for ${metadata.title}, deleting...`
    );
    // Remove all documents with the same URL
    await supabaseClient.from('documents').delete().eq('url', url);
    console.info(chalk.cyan('info'), ' - Done deleting documents');
  }

  console.info(
    chalk.cyan('info'),
    ` - Starting new indexing job for ${metadata.title}`
  );

  const progress = new ProgressBar(':bar', {
    total: chunks.length,
    complete: '\u2588',
    incomplete: '\u2591',
  });

  for await (const chunk of chunks) {
    progress.tick();

    // Use raw text without prefixes for better query-document alignment
    const vector = {
      input: chunk.text,
      metadata: {
        title: metadata.title,
        url,
        section: chunk.section || '',
        heading: chunk.heading || '',
        contentType: chunk.contentType || 'prose',
        language: chunk.language || '',
      },
    };

    try {
      const embeddingResponse = await fetch(
        'https://api.openai.com/v1/embeddings',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPEN_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: OPENAI_EMBEDDING_MODEL,
            input: vector.input,
          }),
        }
      );

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      const { error } = await supabaseClient.from('documents').insert({
        title: vector.metadata.title,
        url: vector.metadata.url,
        content: chunk.text, // Store original text without prefixes
        embedding,
        section: vector.metadata.section,
        heading: vector.metadata.heading,
        content_type: vector.metadata.contentType,
        language: vector.metadata.language,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        chalk.redBright('error'),
        ' - Error saving vectors:',
        error
      );
    }
  }
};

const generateEmbeddingsForFile = async (filePath) => {
  try {
    const { chunks, metadata } = await processMdxFile(filePath);
    await generateEmbeddings(chunks, metadata);
    console.info(chalk.green('success'), ` - Done indexing ${metadata.title}`);
  } catch (error) {
    console.error('Error processing MDX file:', error);
  }
};

const run = async () => {
  const dirPath = process.argv[2];

  const stats = fs.statSync(dirPath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(dirPath);
    console.log('files', files);

    for (const file of files) {
      await generateEmbeddingsForFile(path.join(dirPath, file));
    }
  } else {
    await generateEmbeddingsForFile(dirPath);
  }
};

run();
