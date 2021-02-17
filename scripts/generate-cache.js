/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const prettier = require('prettier');

(async () => {
  const root = process.cwd();
  const prettierConfig = await prettier.resolveConfig('./.prettierrc');

  const typeToPath = {
    blog: 'content',
    snippet: 'snippets',
  };

  function getPosts(type) {
    const files = fs
      .readdirSync(path.join(root, typeToPath[type]))
      .filter((name) => name !== 'img');

    const posts = files
      .reduce((allPosts, postSlug) => {
        const source = fs.readFileSync(
          path.join(root, typeToPath[type], postSlug),
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
      }, [])
      .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

    console.info(`\nCached ${posts.length} ${type} elements`);
    return posts;
  }

  const content = JSON.stringify([...getPosts('blog'), ...getPosts('snippet')]);

  const fileContent = `export const posts = ${content}`;

  const formatted = prettier.format(fileContent, {
    ...prettierConfig,
    parser: 'babel',
  });

  try {
    fs.readdirSync('cache');
  } catch (error) {
    fs.mkdirSync('cache');
  }

  fs.writeFile('cache/data.js', formatted, (error) => {
    if (error) {
      return console.error(error);
    }
  });
})();
