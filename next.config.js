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
});
