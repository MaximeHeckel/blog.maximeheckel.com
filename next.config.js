const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  trailingSlash: true,
  images: {
    domains: [
      // Twitter Images
      'pbs.twimg.com',
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['buble'] = path.resolve(
      './node_modules/@philpl/buble'
    );

    return config;
  },
});
