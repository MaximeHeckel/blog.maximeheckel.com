/* eslint-disable no-console */
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as Github from '@actions/github';
import fs from 'fs';
import { post } from 'request';
import { promisify } from 'util';

const postAsync = promisify(post);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Here we create a new Github client with the GITHUB_TOKEN environment variable
 * that is passed to this action by the Github workflow.
 */
const ghClient =
  process.env.GITHUB_TOKEN && new Github.GitHub(process.env.GITHUB_TOKEN);

/**
 * This variable will store any logs from any exec commands ran by
 * this action
 */
let execLogs = '';

const execOptions = {
  listeners: {
    stdout: (data: Buffer): void => {
      execLogs += data.toString();
    },
    stderr: (data: Buffer): void => {
      execLogs += data.toString();
    },
  },
};

const git = (args: string[]): Promise<number> => {
  return exec.exec('git', args, execOptions);
};

interface SnippetImageArgs {
  code: string;
  fileName: string;
  params: string;
}

/**
 * createSnippetImage calls the serverless function responsible for
 * generating the png for the code snippet sent to the repository dispatch
 * event
 * @param {SnippetImageArgs} args An object with the following fields:
 * - code: the base64 encoded code snippet string
 * - fileName: the name of the output png file
 * - params: the query-stringified carbon.now.sh params object
 */
const createSnippetImage = async (args: SnippetImageArgs): Promise<void> => {
  const { code, fileName, params } = args;

  try {
    const { body } = await postAsync({
      url: `https://carboncloud.now.sh/api/carbonara?${params}`,
      formData: {
        data: code,
      },
    });

    await writeFileAsync(
      `./public/static/snippets/${fileName}.png`,
      body,
      'base64'
    );
    console.info(`Created ${fileName}.png`);
  } catch (e) {
    console.error(e);
  }
};

interface Args {
  email: string;
  username: string;
  title: string;
  code: string;
  language: string;
  params: string;
}

/**
 * createSnippet is the core function of this github action.
 * It executes the following steps:
 * - sets the git config
 * - fetches all the repo branch
 * - checks out to the main branch
 * - decode the base64 encoded code string
 * - writes the code string, title and language to an .mdx file in the /snippets folder
 * - calls createSnippetImage for that specific snippet code string and fileName
 * - commits and pushes the new files
 * @param {Args} args An object with the following fields:
 * - email: the email associated to the github user
 * - username: the username associated to the github user
 * - title: the title/name of the code snippet
 * - code: the base64 encoded code snippet string
 * - language: the language of the code snippet
 * - params: the query-stringified carbon.now.sh params object
 */
const createSnippet = async (args: Args): Promise<void> => {
  const { title, code, language, username, email, params } = args;

  /**
   * Set up git config
   */
  await git(['config', '--local', 'user.name', username]);
  await git(['config', '--local', 'user.email', email]);

  /**
   * Fetch branches and checkout to main
   */
  await git(['fetch', '--all']);
  await git(['checkout', 'main']);

  /**
   * Decode base64 code string
   */
  const buff = Buffer.from(code, 'base64');
  const codeString = buff.toString('utf-8');

  /**
   * Write code string title and language to .mdx file
   */

  const today = new Date();
  const fileName = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}-${title
    .replace(/ /g, '-')
    .replace(/[^\w\s]/gi, '')
    .toLocaleLowerCase()}`;

  /**
   * "data" is the .mdx file content for the new snippet.
   *  It has 4 frontmatter fields:
   *  - title: the title/name of the code snippet
   *  - language: the language of the code snippet
   *  - date: the date when the code snippet was created
   *  - image: the corresponsind code snippet screenshot in png
   */
  const data = `---
title: ${title}
language: ${language}
date: ${today.toISOString().toString()}
slug: ${fileName}
type: snippet
---

\`\`\`${language} snippet
${codeString}
\`\`\`
  `;

  await writeFileAsync(`./snippets/${fileName}.mdx`, data);
  console.info(`Created ${fileName}.mdx`);

  /**
   * Create snippet image
   */
  await createSnippetImage({ code, fileName, params });

  /**
   * Save new files and push
   */
  await git(['add', '-A']);
  await git([
    'commit',
    '-m',
    `"docs(snippet): Add new snippet ${fileName}.mdx"`,
  ]);
  await git([
    'push',
    `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${username}/blog.maximeheckel.com.git`,
    'main',
  ]);
};

/**
 * Core function of the Github action
 */
const run = async (): Promise<void> => {
  /**
   * We first parse the inputs of the action that are passed by the Github workflow
   */
  const title = core.getInput('title');
  const code = core.getInput('code');
  const language = core.getInput('language');
  const params = core.getInput('params');

  /**
   * Then we get the Github context in which this action is being ran
   */
  const context = await Github.context;

  /**
   * We get the repositorie's owner's name by splitting the full name of the
   * repository and reading the first item in the resulting array.
   */
  const repo = context.payload.repository!.full_name!.split('/');
  const [owner] = repo!;

  const client = ghClient;

  if (!client) throw 'Failed to load Github client from token.';

  /**
   * With the username we get the user's email by using the Github client instanciated
   * above (L16). The username and email are used to setup the local git config to have
   * proper commit messages and commit authors.
   */
  const {
    data: { email },
  } = await client.users.getByUsername({ username: owner });

  try {
    /**
     * Run the createSnippet function
     */
    await createSnippet({
      email,
      username: owner,
      title,
      code,
      language,
      params,
    });
  } catch (e) {
    /**
     * If it fails, log the error, set the action to failed and send any exec logs gathered by
     * the action as error payload (useful for debugging)
     */
    console.error(e);
    core.setFailed(execLogs);
  }
};

run();
