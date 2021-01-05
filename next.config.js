module.exports = {
  trailingSlash: true,
  target: 'serverless',
  webpack: (config, { dev, isServer }) => {
    if (isServer) {
      require('./scripts/generate-sitemap');
      require('./scripts/generate-cache');
      require('./scripts/generate-rss');
    }

    return config;
  },
};
