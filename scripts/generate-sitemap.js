/* eslint-disable no-console */
const chalk = require('chalk');
const fs = require('fs');
const globby = require('globby');
const prettier = require('prettier');

(async () => {
  console.info(chalk.cyan('info'), ` - Generating sitemap`);

  const prettierConfig = await prettier.resolveConfig('./.prettierrc');
  const pages = await globby([
    'pages/*.js',
    'pages/*.tsx',
    'snippets/**/*.mdx',
    'content/**/*.mdx',
    '!pages/_*.js',
    '!pages/_*.tsx',
    '!pages/api',
    '!pages/404.tsx',
  ]);

  const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
            ${pages
              .map((page) => {
                const path = page
                  .replace('pages', '')
                  .replace('snippets', '/snippets')
                  .replace('content', '/posts')
                  .replace('.js', '')
                  .replace('.tsx', '')
                  .replace('.ts', '')
                  .replace('.mdx', '');
                const route = path === '/index' ? '' : path;

                return `
                        <url>
                            <loc>${`https://blog.maximeheckel.com${route}/`}</loc>
                            <changefreq>daily</changefreq>
                            <priority>0.7</priority>
                        </url>
                    `;
              })
              .join('')}
        </urlset>
    `;

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  });

  // eslint-disable-next-line no-sync
  fs.writeFileSync('public/sitemap.xml', formatted);
})();
