const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  trailingSlash: true,
  target: 'serverless',
  images: {
    domains: [
      // Twitter Images
      'pbs.twimg.com',
    ],
  },
});
