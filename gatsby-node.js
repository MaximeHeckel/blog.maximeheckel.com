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
