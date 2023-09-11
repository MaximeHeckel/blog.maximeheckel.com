/* eslint-disable no-console */
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const chalk = require('chalk');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');
const ProgressBar = require('progress');
const { fileURLToPath } = require('url');
const processMdxFile = require('./process-mdx.js');

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const BLOG_URL = process.env.BLOG_URL;
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const configuration = new Configuration({ apiKey: OPEN_AI_API_KEY });
const openAI = new OpenAIApi(configuration);

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
      const { data: embed } = await openAI.createEmbedding({
        input: vector.input,
        model: OPENAI_EMBEDDING_MODEL,
      });
      const embedding = embed.data[0].embedding;

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
