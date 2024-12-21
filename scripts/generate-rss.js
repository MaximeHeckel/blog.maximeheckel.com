/* eslint-disable no-console */
import chalk from 'chalk';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import RSS from 'rss';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.info(chalk.cyan('info'), ` - Generating RSS feed`);

  const root = process.cwd();

  function getPosts() {
    const files = fs
      .readdirSync(path.join(root, 'content'))
      .filter((name) => name !== 'img');

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

    return posts;
  }

  try {
    const feed = new RSS({
      title: "Maxime Heckel's Blog",
      description:
        "Hi I'm Maxime, and this is my blog. Here, I share through my writing my experience as a frontend engineer and everything I'm learning about on React, Typescript, SwiftUI, Serverless, and testing.",
      site_url: 'https://blog.maximeheckel.com',
      feed_url: 'https://blog.maximeheckel.com/rss.xml',
      image_url: 'https://blog.maximeheckel.com/static/og/main-og-image.png',
      language: 'en',
    });

    const content = [...getPosts()].sort((post1, post2) =>
      post1.date > post2.date ? -1 : 1
    );

    content.forEach((post) => {
      const url = `https://blog.maximeheckel.com/posts/${post.slug}`;

      feed.item({
        title: post.title,
        description: post.subtitle,
        date: new Date(post.date),
        author: 'Maxime heckel',
        url,
        guid: url,
      });
    });

    const rss = feed.xml({ indent: true });
    fs.writeFileSync(path.join(__dirname, '../public/rss.xml'), rss);
  } catch (error) {
    console.error(
      chalk.red('error'),
      ` - An error occurred while generating the RSS feed`
    );
    console.error(error);
    process.exit(1);
  }
})();
