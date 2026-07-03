/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import 'dotenv/config';
import processMdxFile from './process-mdx.js';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const OUTPUT_PATH = path.join(CONTENT_DIR, 'glossary.json');
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_GLOSSARY_MODEL =
  process.env.OPENAI_GLOSSARY_MODEL || 'gpt-4.1-mini';

const MAX_BATCH_CHARACTERS = 45000;
const GENERIC_TERM_ENDINGS = new Set([
  'algorithm',
  'application',
  'approach',
  'article',
  'blog',
  'demo',
  'development',
  'documentation',
  'example',
  'experiment',
  'exploration',
  'framework',
  'function',
  'guide',
  'implementation',
  'iteration',
  'method',
  'overview',
  'pipeline',
  'post',
  'project',
  'reference',
  'research',
  'resource',
  'sample',
  'step',
  'study',
  'system',
  'technique',
  'tutorial',
  'use case',
  'value',
  'variable',
]);
const OVER_SPECIFIC_ENDINGS = new Set([
  'coefficient',
  'intersection',
  'reconstruction',
  'separation',
  'visibility',
]);
const SPECIALIZED_SUFFIXES = new Set(['lut']);

function printUsage() {
  console.log(`
Usage:
  pnpm generate:glossary
  pnpm generate:glossary -- content/post-slug.mdx
  pnpm generate:glossary -- content/post-slug.mdx --merge
  pnpm generate:glossary -- --definitions-only
  pnpm generate:glossary -- --terms-only
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const merge = args.includes('--merge');
  const definitionsOnly = args.includes('--definitions-only');
  const termsOnly = args.includes('--terms-only');
  const help = args.includes('--help') || args.includes('-h');
  const fileArgs = args.filter((arg) => !arg.startsWith('--'));

  if (help) {
    printUsage();
    process.exit(0);
  }

  if (fileArgs.length > 1) {
    throw new Error('Expected at most one MDX file path.');
  }

  if (merge && fileArgs.length === 0) {
    throw new Error('--merge can only be used with a specific MDX file.');
  }

  if (definitionsOnly && termsOnly) {
    throw new Error('--definitions-only and --terms-only cannot be combined.');
  }

  if (definitionsOnly && merge) {
    throw new Error('--definitions-only and --merge cannot be combined.');
  }

  return {
    definitionsOnly,
    merge,
    targetFile: fileArgs[0],
    termsOnly,
  };
}

function resolveTargetFile(targetFile) {
  const resolvedPath = path.resolve(process.cwd(), targetFile);
  const relativeToContent = path.relative(CONTENT_DIR, resolvedPath);

  if (
    relativeToContent.startsWith('..') ||
    path.isAbsolute(relativeToContent)
  ) {
    throw new Error('The target file must live inside the content directory.');
  }

  if (!resolvedPath.endsWith('.mdx')) {
    throw new Error('The target file must be an .mdx file.');
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  return resolvedPath;
}

function getInputFiles(targetFile) {
  if (targetFile) {
    return [resolveTargetFile(targetFile)];
  }

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => path.join(CONTENT_DIR, file))
    .sort((fileA, fileB) => fileA.localeCompare(fileB));
}

function normalizeTerm(term) {
  return term.replace(/\s+/g, ' ').trim();
}

function normalizeDefinition(definition) {
  return definition.replace(/\s+/g, ' ').trim();
}

function normalizeAliases(aliases) {
  return Array.isArray(aliases)
    ? aliases
        .filter((item) => typeof item === 'string')
        .map((item) => normalizeTerm(item))
        .filter(Boolean)
    : [];
}

function normalizeOrigin(origin) {
  return Array.isArray(origin)
    ? origin.filter((item) => typeof item === 'string' && item.trim())
    : [];
}

function normalizeKind(kind) {
  return kind === 'function' ? 'function' : 'other';
}

function isUsefulTerm(term) {
  const words = term.split(/\s+/);
  const lowerCaseTerm = term.toLowerCase();

  if (words.length > 3) {
    return false;
  }

  if (lowerCaseTerm.includes('scattering atmospheric')) {
    return false;
  }

  if (words.length > 2) {
    for (const ending of GENERIC_TERM_ENDINGS) {
      if (lowerCaseTerm.endsWith(` ${ending}`)) {
        return false;
      }
    }
  }

  for (const ending of OVER_SPECIFIC_ENDINGS) {
    if (lowerCaseTerm.endsWith(` ${ending}`)) {
      return false;
    }
  }

  if (term.includes('_')) {
    return false;
  }

  if (/^[a-z]+[A-Z]/.test(term)) {
    return false;
  }

  return true;
}

function sortTerms(terms) {
  return terms.sort((termA, termB) =>
    termA.term.localeCompare(termB.term, 'en', { sensitivity: 'base' })
  );
}

function sortOrigin(origin) {
  return Array.from(new Set(origin)).sort((slugA, slugB) =>
    slugA.localeCompare(slugB)
  );
}

function sortAliases(aliases) {
  return Array.from(new Set(aliases)).sort((aliasA, aliasB) =>
    aliasA.localeCompare(aliasB, 'en', { sensitivity: 'base' })
  );
}

function pruneVariantTerms(terms) {
  const sortedTerms = sortTerms([...terms]);

  return sortedTerms.filter((term) => {
    const lowerCaseTerm = term.term.toLowerCase();

    return !sortedTerms.some((otherTerm) => {
      const lowerCaseOtherTerm = otherTerm.term.toLowerCase();

      if (lowerCaseOtherTerm === lowerCaseTerm) {
        return false;
      }

      if (!lowerCaseOtherTerm.startsWith(`${lowerCaseTerm} `)) {
        return false;
      }

      const suffix = lowerCaseOtherTerm.slice(lowerCaseTerm.length).trim();

      return !SPECIALIZED_SUFFIXES.has(suffix);
    });
  });
}

function dedupeTerms(terms) {
  const termsByKey = new Map();

  for (const item of terms) {
    const rawTerm = typeof item === 'string' ? item : item?.term;
    const rawAliases = typeof item === 'string' ? [] : item?.aliases;
    const rawDefinition = typeof item === 'string' ? '' : item?.definition;
    const rawKind = typeof item === 'string' ? 'other' : item?.kind;
    const rawOrigin = typeof item === 'string' ? [] : item?.origin;

    if (typeof rawTerm !== 'string') {
      continue;
    }

    const term = normalizeTerm(rawTerm);
    if (!term) {
      continue;
    }

    if (!isUsefulTerm(term)) {
      continue;
    }

    const key = term.toLowerCase();
    const definition =
      typeof rawDefinition === 'string'
        ? normalizeDefinition(rawDefinition)
        : '';
    const kind = normalizeKind(rawKind);
    const aliases = sortAliases(normalizeAliases(rawAliases));
    const origin = sortOrigin(normalizeOrigin(rawOrigin));

    if (!termsByKey.has(key)) {
      termsByKey.set(key, {
        ...(aliases.length > 0 ? { aliases } : {}),
        ...(definition ? { definition } : {}),
        kind,
        ...(origin.length > 0 ? { origin } : {}),
        term,
      });
      continue;
    }

    const existingTerm = termsByKey.get(key);
    termsByKey.set(key, {
      ...existingTerm,
      aliases: sortAliases([...(existingTerm.aliases || []), ...aliases]),
      ...(existingTerm.definition || !definition ? {} : { definition }),
      kind:
        existingTerm.kind === 'function' || kind === 'function'
          ? 'function'
          : 'other',
      origin: sortOrigin([...(existingTerm.origin || []), ...origin]),
    });
  }

  return pruneVariantTerms(Array.from(termsByKey.values()));
}

function loadExistingGlossary() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    return [];
  }

  const glossary = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));

  if (!Array.isArray(glossary)) {
    throw new Error('Existing glossary.json must be an array.');
  }

  return dedupeTerms(glossary);
}

function applyExistingMetadata(terms, existingTerms) {
  const existingTermsByKey = new Map(
    existingTerms.map((item) => [item.term.toLowerCase(), item])
  );

  return terms.map((item) => {
    const existingTerm = existingTermsByKey.get(item.term.toLowerCase());

    if (!existingTerm) {
      return item;
    }

    return {
      ...item,
      ...(item.definition || !existingTerm.definition
        ? {}
        : { definition: existingTerm.definition }),
      aliases: sortAliases([
        ...(existingTerm.aliases || []),
        ...(item.aliases || []),
      ]),
      kind:
        item.kind === 'function' || existingTerm.kind === 'function'
          ? 'function'
          : 'other',
      origin: sortOrigin([
        ...(existingTerm.origin || []),
        ...(item.origin || []),
      ]),
    };
  });
}

function createBatches(posts) {
  const batches = [];
  let currentBatch = '';

  for (const post of posts) {
    const entry = `# ${post.title}\n${post.text}\n\n`;

    if (
      currentBatch.length > 0 &&
      currentBatch.length + entry.length > MAX_BATCH_CHARACTERS
    ) {
      batches.push(currentBatch);
      currentBatch = '';
    }

    currentBatch += entry;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

function createDefinitionContext(posts) {
  return posts
    .map((post) => `# ${post.title}\n${post.text}`)
    .join('\n\n---\n\n')
    .slice(0, 90000);
}

function normalizeSearchText(value) {
  return value
    .toLowerCase()
    .replace(/[-_/]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getOriginSearchTerms(term) {
  const normalizedTerm = normalizeSearchText(term);
  const searchTerms = [normalizedTerm];

  if (normalizedTerm.endsWith(' color model')) {
    searchTerms.push(normalizedTerm.replace(/ color model$/, ''));
  }

  return searchTerms;
}

function assignOrigins(terms, posts) {
  return terms.map((item) => {
    const searchTerms = getOriginSearchTerms(item.term);
    const origin = posts
      .filter((post) => {
        const postText = normalizeSearchText(`${post.title} ${post.text}`);
        return searchTerms.some((term) => postText.includes(term));
      })
      .map((post) => post.slug);
    const nextOrigin =
      origin.length === 0 && posts.length === 1 ? [posts[0].slug] : origin;

    return {
      ...item,
      origin: sortOrigin([...(item.origin || []), ...nextOrigin]),
    };
  });
}

function chunkTerms(terms, chunkSize) {
  const chunks = [];

  for (let index = 0; index < terms.length; index += chunkSize) {
    chunks.push(terms.slice(index, index + chunkSize));
  }

  return chunks;
}

async function readPosts(files) {
  const posts = [];

  for (const file of files) {
    const { metadata, chunks } = await processMdxFile(file);
    const text = chunks
      .filter((chunk) => chunk.contentType !== 'code')
      .map((chunk) => chunk.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      console.log(chalk.yellow(`Skipping empty file: ${file}`));
      continue;
    }

    posts.push({
      slug: metadata.slug || path.basename(file, '.mdx'),
      title: metadata.title || path.basename(file, '.mdx'),
      text,
    });
  }

  return posts;
}

async function extractTermsFromBatch(batch, index, total) {
  console.log(chalk.cyan(`Extracting terms from batch ${index + 1}/${total}`));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_GLOSSARY_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You create a reader-facing glossary for a technical blog about coding, animation, frontend development, and graphics programming. Return only JSON with a "terms" array. Each item must have "term" and "kind". "kind" must be either "function" or "other". Use "function" only for callable programming/shader functions such as "fwidth", "fract", or "smoothstep"; use "other" for everything else. First infer the article theme: the central technical subject, programming domain, and learning goal. Then extract only technical terms that are both directly linked to that theme and relevant to coding, animation, frontend development, or graphics programming. Do not extract every technical-looking phrase. Prefer terms that help a reader understand the article as a programming or rendering article. Terms should usually be 1 to 2 words, and never more than 3 words. Good examples for an atmospheric rendering article: "atmospheric scattering", "Rayleigh scattering", "Mie scattering", "optical depth", "transmittance", "phase function", "sky-view LUT", "aerial perspective LUT", "raymarching", "post-processing". Include physics/math terms only when they are core to the graphics programming technique being implemented. Good examples for a WebGPU article: "WebGPU", "compute shader", "WGSL", "bind group", "storage buffer", "render pipeline". Good examples for a frontend animation article: "layout animation", "spring animation", "easing", "FLIP", "shared layout". Avoid terms that are merely supporting implementation details, even if technical, unless they are central to the theme. For example, in an atmospheric rendering article, avoid "depth buffer", "frame buffer object", "angular separation", "ray-sphere intersection", and "world-space reconstruction" unless the article is specifically about those concepts. Avoid vague container terms when a better domain concept exists: use "atmospheric scattering", not "atmosphere shader". Avoid narrow derived variants when a clearer parent term exists: use "Rayleigh scattering", not "Rayleigh scattering coefficient"; use "Mie scattering", not "Mie extinction coefficient". Bad examples: variable names, function names, constants, article titles, people names, generic nouns, repeated variants, and invented compound phrases like "scattering atmospheric light calculation". Do not include camelCase identifiers, ALL_CAPS constants, implementation-specific helper names, or phrases ending in generic words like coefficient, intersection, reconstruction, separation, visibility, article, blog, example, implementation, method, project, system, tutorial, use case, variable, value, or function. Do not create terms by mechanically combining nearby words. Limit the result to the 18 most useful theme-linked programming terms for this batch.',
        },
        {
          role: 'user',
          content: `Extract glossary terms from this MDX-derived corpus:\n\n${batch}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI request failed (${response.status}): ${errorText.slice(0, 500)}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response did not include message content.');
  }

  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed.terms)) {
    throw new Error('OpenAI response must contain a terms array.');
  }

  return dedupeTerms(parsed.terms);
}

async function generateDefinitionsForTerms(terms, context) {
  const termsMissingDefinitions = terms.filter((item) => !item.definition);

  if (termsMissingDefinitions.length === 0) {
    console.log(chalk.gray('All glossary definitions already exist.'));
    return terms;
  }

  const termChunks = chunkTerms(termsMissingDefinitions, 24);
  const entries = [];

  for (let index = 0; index < termChunks.length; index++) {
    const termChunk = termChunks[index];
    console.log(
      chalk.cyan(
        `Generating definitions for terms ${index + 1}/${termChunks.length}`
      )
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_GLOSSARY_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You write concise reader-facing glossary definitions for a technical blog about coding, animation, frontend development, and graphics programming. Return only JSON with an "entries" array. Each entry must have "term" and "definition". Define each term in the context of programming, frontend, animation, shaders, or graphics programming. Definitions must be one short sentence, plain English, no markdown, no examples, no more than 16 words. Do not invent new terms and do not rename terms.',
          },
          {
            role: 'user',
            content: `Terms to define:\n${JSON.stringify(
              termChunk.map((item) => item.term),
              null,
              2
            )}\n\nArticle context:\n${context}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI request failed (${response.status}): ${errorText.slice(0, 500)}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI response did not include message content.');
    }

    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed.entries)) {
      throw new Error('OpenAI response must contain an entries array.');
    }

    entries.push(...parsed.entries);
  }

  const definitionsByTerm = new Map();

  for (const entry of entries) {
    if (
      entry &&
      typeof entry.term === 'string' &&
      typeof entry.definition === 'string'
    ) {
      definitionsByTerm.set(
        entry.term.toLowerCase(),
        normalizeDefinition(entry.definition)
      );
    }
  }

  return terms.map((item) => {
    if (item.definition) {
      return item;
    }

    const definition = definitionsByTerm.get(item.term.toLowerCase());
    return definition ? { ...item, definition } : item;
  });
}

function saveGlossary(terms) {
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(terms, null, 2)}\n`);
  console.log(chalk.green(`\nGlossary generated: ${OUTPUT_PATH}`));
  console.log(chalk.gray(`Terms: ${terms.length}`));
}

async function main() {
  const { definitionsOnly, merge, targetFile, termsOnly } = parseArgs();
  const files = getInputFiles(targetFile);

  if (!OPEN_AI_API_KEY) {
    throw new Error('Missing OPEN_AI_API_KEY environment variable.');
  }

  console.log(chalk.cyan(`Processing ${files.length} MDX file(s)...`));

  const posts = await readPosts(files);
  const batches = createBatches(posts);
  const definitionContext = createDefinitionContext(posts);
  const extractedTerms = [];
  const existingTerms = loadExistingGlossary();

  if (!definitionsOnly) {
    for (let index = 0; index < batches.length; index++) {
      const terms = await extractTermsFromBatch(
        batches[index],
        index,
        batches.length
      );
      console.log(terms);
      extractedTerms.push(...terms);
    }
  }

  const extractedGlossaryTerms = definitionsOnly
    ? existingTerms
    : merge
      ? dedupeTerms([...existingTerms, ...extractedTerms])
      : applyExistingMetadata(dedupeTerms(extractedTerms), existingTerms);

  const terms = assignOrigins(extractedGlossaryTerms, posts);

  const nextTerms = termsOnly
    ? terms
    : await generateDefinitionsForTerms(terms, definitionContext);

  saveGlossary(nextTerms);
}

main().catch((error) => {
  console.error(chalk.red(error.message));
  printUsage();
  process.exit(1);
});
