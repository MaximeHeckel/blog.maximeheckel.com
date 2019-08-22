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
        short_name: `maximehblog`,
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
    'gatsby-plugin-typescript',
    'gatsby-plugin-tslint',
  ],
};
