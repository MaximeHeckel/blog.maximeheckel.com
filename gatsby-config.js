module.exports = {
  siteMetadata: {
    pathPrefix: '/',
    keywords: [
      'application',
      'react',
      'redux',
      'typescript',
      'jest',
      'kubernetes',
      'portfolio',
      'docker',
      'entreprise',
      'nyc',
      'new york',
      'frontend',
      'engineering',
    ],
    title: `Maxime Heckel's blog`,
    titleAlt: `Maxime Heckel's blog`,
    description:
      'Maxime Heckel is a senior frontend engineer and space enthusiast currently working for Docker in San Francisco.',
    url: 'https://maximeheckel.com', // Site domain without trailing slash
    siteUrl: 'https://maximeheckel.com/', // url + pathPrefix
    siteLanguage: 'en', // Language Tag on <html> element
    shortName: 'MaximeHeckelBlog',
    author: 'Maxime Heckel', // Author for schemaORGJSONLD
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    twitter: '@MaximeHeckel', // Twitter Username
    twitterDesc:
      'Maxime Heckel is a senior frontend engineer and space enthusiast currently working for Docker in San Francisco.',
  },
  plugins: [
    {
      resolve: `gatsby-theme-maximeheckel`,
      options: {},
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `maximeheckelblog`,
        short_name: `maximehblog`,
        start_url: `/`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#ffffff`,
        display: `minimal-ui`,
        icon: `static/favicon.png`, // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-sitemap',
    'gatsby-plugin-typescript',
    'gatsby-plugin-tslint',
  ],
};
