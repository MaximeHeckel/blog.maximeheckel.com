const slugify = require('@sindresorhus/slugify');
const { runScreenshots } = require('gatsby-plugin-printer');

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMdx {
              edges {
                node {
                  id
                  tableOfContents
                  timeToRead
                  frontmatter {
                    slug
                    title
                    description
                    date
                    type
                    cover {
                      childImageSharp {
                        fluid(
                          maxWidth: 1500
                          maxHeight: 700
                          quality: 100
                          cropFocus: ENTROPY
                        ) {
                          base64
                          tracedSVG
                          aspectRatio
                          src
                          srcSet
                          srcWebp
                          srcSetWebp
                          sizes
                          originalImg
                          originalName
                          presentationWidth
                          presentationHeight
                        }
                      }
                    }
                  }
                  parent {
                    ... on File {
                      sourceInstanceName
                      absolutePath
                      relativePath
                      name
                    }
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors);
        }

        // Create blog posts pages.
        result.data.allMdx.edges.forEach(({ node }) => {
          createPage({
            path: `/posts/${node.frontmatter.slug}`,
            component: node.parent.absolutePath,
            context: {
              absPath: node.parent.absolutePath,
              timeToRead: node.timeToRead,
              cover: node.frontmatter.cover,
              tableOfContents: node.tableOfContents,
            },
          });
        });
      })
    );
  });
};

// exports.onCreateNode = ({ actions, node }) => {
//   if (node.internal.type === 'Mdx') {
//     // createPrinterNode creates an object that can be passed in
//     // to `createNode`
//     const printerNode = createPrinterNode({
//       id: node.id,
//       // fileName is something you can use in opengraph images, etc
//       fileName: slugify(node.frontmatter.title),
//       // renderDir is relative to `public` by default
//       outputDir: 'opengraph-images',
//       // data gets passed directly to your react component
//       data: node.frontmatter,
//       // the component to use for rendering. Will get batched with
//       // other nodes that use the same component
//       component: require.resolve('./src/components/Printer/index.js'),
//     });
//   }
// };

exports.onPostBuild = async ({ graphql }) => {
  const data = await graphql(`
    {
      allMdx {
        edges {
          node {
            frontmatter {
              title
            }
          }
        }
      }
    }
  `).then(r => {
    if (r.errors) {
      console.error(r.errors.join(`, `));
    }
    return r.data;
  });

  const titles = data.allMdx.edges.map(
    ({
      node: {
        frontmatter: { title },
      },
    }) => ({
      id: slugify(title),
      title,
    })
  );

  await runScreenshots({
    data: titles,
    component: require.resolve('./src/components/Printer/index.js'),
    outputDir: 'opengraph-images',
  });
};
