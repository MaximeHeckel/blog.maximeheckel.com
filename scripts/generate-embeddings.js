/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import 'dotenv/config';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import ProgressBar from 'progress';
import { fileURLToPath } from 'url';

import processMdxFile from './process-mdx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY_BYPASS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const BLOG_URL = process.env.BLOG_URL;
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY);
const openAI = new OpenAI({ apiKey: OPEN_AI_API_KEY });

const generateEmbeddings = async (chunks, metadata) => {
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
    const vector = {
      input: chunk.text,
      metadata: {
        title: metadata.title,
        url,
      },
    };

    try {
      const embeddingResponse = await openAI.embeddings.create({
        input: vector.input,
        model: OPENAI_EMBEDDING_MODEL,
      });

      const embedding = embeddingResponse.data[0].embedding;

      await supabaseClient.from('documents').insert({
        title: vector.metadata.title,
        url: vector.metadata.url,
        content: vector.input,
        embedding,
      });
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

    for (const file of files) {
      await generateEmbeddingsForFile(path.join(dirPath, file));
    }
  } else {
    await generateEmbeddingsForFile(dirPath);
  }
};

run();
