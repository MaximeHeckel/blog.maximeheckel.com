/* eslint-disable no-console */
// https://phiilu.com/generate-open-graph-images-for-your-static-next-js-site
const playwright = require('playwright-aws-lambda');
const chalk = require('chalk');
const { createHash } = require('crypto');
const fs = require('fs');
const matter = require('gray-matter');
const path = require('path');
const qs = require('qs');

const ogImageDir = `./public/static/og`;

(async () => {
  const root = process.cwd();

  console.info(chalk.cyan('info'), ` - Generating Opengraph images`);

  if (process.env.NODE_ENV === 'development') {
    console.info(
      chalk.yellow('warn'),
      ` - Opengraph images will only be generated in production build`
    );
    return;
  }

  const files = fs.readdirSync(path.join(root, 'content'));

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
      color: post.fontFeatured,
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

    const url = `https://og-image-maximeheckel.netlify.app/ogimage?${qs.stringify(
      filteredParams
    )}`;

    try {
      fs.statSync(imagePath);
    } catch (error) {
      console.info(
        chalk.yellowBright(`Generating Opengraph image for ${post.title}`)
      );

      try {
        const browser = await playwright.launchChromium({ headless: true });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1200, height: 630 });
        await page.goto(url, { waitUntil: 'networkidle' });

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
