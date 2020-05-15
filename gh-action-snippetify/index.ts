/* eslint-disable no-console */
import fs from 'fs';
import { post } from 'request';
import { promisify } from 'util';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as Github from '@actions/github';

const postAsync = promisify(post);
const writeFileAsync = promisify(fs.writeFile);

const ghClient =
  process.env.GITHUB_TOKEN && new Github.GitHub(process.env.GITHUB_TOKEN);

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
}

/**
 * createSnippetImage calls the serverless function responsible for
 * generating the png for the code snippet sent to the repository dispatch
 * event
 * @param {SnippetImageArgs} args An object with the following fields:
 * - code: the base64 encoded code snippet string
 * - fileName: the name of the output png file
 */
const createSnippetImage = async (args: SnippetImageArgs): Promise<void> => {
  const { code, fileName } = args;

  try {
    const { body } = await postAsync({
      url: 'https://carboncloud.now.sh/api/carbonara',
      formData: {
        data: code,
      },
    });

    await writeFileAsync(`./snippets/img/${fileName}.png`, body, 'base64');
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
}

/**
 * createSnippet is the core function of this github action.
 * It executes the following steps:
 * - sets the git config
 * - fetches all the repo branch
 * - checks out to the master branch
 * - decode the base64 encoded code string
 * - writes the code string, title and language to an .mdx file in the /snippets folder
 * - calls createSnippetImage for that specific snippet code string and fileName
 * - commits and pushes the new files
 * @param {Args} args An object with the following fields:
 * - email: the email associated to the github user,
 * - username: the username associated to the github user,
 * - title: the title of the code snippet,
 * - code: the base64 encoded code snippet string,
 * - language: the language of the code snippet,
 *
 */
const createSnippet = async (args: Args): Promise<void> => {
  const { title, code, language, username, email } = args;
  console.log(username);
  console.log(email);
  console.log('TOKEN:', process.env.GITHUB_TOKEN);

  /**
   * Set up git config
   */
  await git(['config', '--local', 'user.name', username]);
  await git(['config', '--local', 'user.email', email]);

  /**
   * Fetch branches and checkout to master
   */
  await git(['fetch', '--all']);
  await git(['checkout', 'master']);

  /**
   * Decode base64 code string
   */
  const buff = Buffer.from(code, 'base64');
  const codeString = buff.toString('utf-8');

  /**
   * Write code string title and language to .mdx file
   */

  const today = new Date();
  const fileName = `${today.getFullYear()}-${today.getMonth() +
    1}-${today.getDate()}-${title.replace(/ /g, '-').toLocaleLowerCase()}`;

  const data = `
  ---
  image: './img/${fileName}.png'
  ---

  \`\`\`${language} title=${title}

  ${codeString}

\`\`\`
  `;

  await writeFileAsync(`./snippets/${fileName}.mdx`, data);
  console.info(`Created ${fileName}.mdx`);

  /**
   * Create snippet image
   */
  await createSnippetImage({ code, fileName });

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
    'master',
  ]);
};

const run = async (): Promise<void> => {
  const title = core.getInput('title');
  const code = core.getInput('code');
  const language = core.getInput('language');

  const context = await Github.context;
  const repo = context.payload.repository!.full_name!.split('/');
  const [owner] = repo!;

  const client = ghClient;

  if (!client) throw 'Failed to load Github client from token.';

  const {
    data: { email },
  } = await client.users.getByUsername({ username: owner });

  try {
    await createSnippet({
      email,
      username: owner,
      title,
      code,
      language,
    });
  } catch (e) {
    console.error(e);
    core.setFailed(execLogs);
  }
};

run();
