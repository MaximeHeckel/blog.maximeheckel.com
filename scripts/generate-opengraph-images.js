import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* eslint-disable no-console */
import chalk from 'chalk';
import matter from 'gray-matter';
import playwright from 'playwright-core';
import qs from 'qs';

const ogImageDir = `./public/static/og`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const root = process.cwd();

  console.info(chalk.cyan('info'), ` - Generating Opengraph images`);

  const files = fs
    .readdirSync(path.join(root, 'content'))
    .filter((file) => file !== 'LICENSE' && file.endsWith('.mdx'));

  const posts = files.reduce((allPosts, postSlug) => {
    const source = fs.readFileSync(
      path.join(root, 'content', postSlug),
      'utf8'
    );
    const { data } = matter(source);
    return [
      {
        ...data,
        slug: postSlug.replace('.mdx', ''),
      },
      ...allPosts,
    ];
  }, []);

  for (let index = 0; index < posts.length; index++) {
    const post = posts[index];
    const hash = createHash('md5').update(post.title).digest('hex');

    const imagePath = `${ogImageDir}/${hash}.png`;

    const params = {
      title: post.title,
      background: post.colorFeatured,
    };

    const filteredParams = Object.keys(params).reduce((acc, curr) => {
      if (!params[curr] || params[curr] === 'undefined') {
        return acc;
      }
      return {
        ...acc,
        [curr]: params[curr],
      };
    }, {});

    const url = `http://localhost:3000/og?${qs.stringify(filteredParams)}`;

    try {
      fs.statSync(imagePath);
    } catch (_error) {
      console.info(
        chalk.yellowBright(
          `      - Generating Opengraph image for ${post.title}`
        )
      );

      try {
        const browser = await playwright.chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1800, height: 945 });
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(100);

        const buffer = await page.screenshot({ type: 'png' });
        await browser.close();

        fs.mkdirSync(ogImageDir, { recursive: true });
        fs.writeFileSync(imagePath, buffer);
      } catch (error) {
        console.error(
          chalk.red('error'),
          ` - An error occurred while generating the Opengraph image for ${post.title}`
        );
        console.error(error);
        process.exit(1);
      }
    }
  }
})();
