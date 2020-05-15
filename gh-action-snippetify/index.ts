import * as core from '@actions/core';
// import * as exec from '@actions/exec';
// import * as Github from '@actions/github';

// const ghClient =
//   process.env.GITHUB_TOKEN && new Github.GitHub(process.env.GITHUB_TOKEN);

// let execLogs = '';

// const execOptions = {
//   listeners: {
//     stdout: (data: Buffer): void => {
//       execLogs += data.toString();
//     },
//     stderr: (data: Buffer): void => {
//       execLogs += data.toString();
//     },
//   },
// };

// const git = (args: string[]): Promise<number> => {
//   return exec.exec('git', args, execOptions);
// };

const run = async (): Promise<void> => {
  const title = core.getInput('title');
  const code = core.getInput('code');
  const language = core.getInput('language');
  // eslint-disable-next-line no-console
  console.log(title);
  // eslint-disable-next-line no-console
  console.log(code);
  // eslint-disable-next-line no-console
  console.log(language);
};

run();
