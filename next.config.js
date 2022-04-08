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
  webpack(config, { isServer, buildId }) {
    config.resolve.alias['react'] = path.resolve('./node_modules/react');
    config.resolve.alias['react-dom'] = path.resolve(
      './node_modules/react-dom'
    );

    return config;
  },
});
