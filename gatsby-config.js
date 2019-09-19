const config = require('./config/site');

module.exports = {
  siteMetadata: {
    ...config,
  },
  plugins: [
    {
      resolve: `gatsby-theme-maximeheckel`,
      options: {},
    },
    {
      resolve: 'gatsby-plugin-lunr',
      options: {
        languages: [{ name: 'en' }],
        fields: [
          { name: 'title', store: true, attributes: { boost: 20 } },
          { name: 'description', store: true, attributes: { boost: 5 } },
          { name: 'content' },
          { name: 'slug', store: true },
          { name: 'date', store: true },
        ],
        resolvers: {
          Mdx: {
            title: node => node.frontmatter.title,
            description: node => node.frontmatter.description,
            content: node => node.rawBody,
            date: node => node.frontmatter.date,
            slug: node => `/posts/${node.frontmatter.slug}`,
          },
        },
        filename: 'search_index.json',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/content/`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Maxime Heckel's blog`,
        short_name: `Maxime Heckel's blog`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#ffffff`,
        display: `minimal-ui`,
        icon: `static/icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-56475503-4',
        head: true,
      },
    },
    'gatsby-plugin-sitemap',
    'gatsby-plugin-offline',
    'gatsby-plugin-typescript',
    'gatsby-plugin-tslint',
  ],
};
