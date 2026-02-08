import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy endpoint for Twitter videos to bypass CORS restrictions.
 * Twitter's CDN blocks cross-origin requests from non-Twitter domains.
 *
 * Usage: /api/twitter-video?url=<encoded-twitter-video-url>
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Validate it's a Twitter video URL
  if (
    !url.startsWith('https://video.twimg.com/') &&
    !url.startsWith('https://pbs.twimg.com/')
  ) {
    return res.status(400).json({ error: 'Invalid Twitter video URL' });
  }

  try {
    const range = req.headers.range;

    const headers: HeadersInit = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://twitter.com/',
      Origin: 'https://twitter.com',
    };

    // Forward range header for video seeking
    if (range) {
      headers['Range'] = range;
    }

    const response = await fetch(url, { headers });

    if (!response.ok && response.status !== 206) {
      return res
        .status(response.status)
        .json({ error: `Twitter returned ${response.status}` });
    }

    // Forward relevant headers
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    // Cache the video for 7 days
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

    // Set appropriate status (200 or 206 for partial content)
    res.status(response.status);

    // Stream the response body
    if (response.body) {
      const reader = response.body.getReader();

      const stream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      };

      await stream();
    } else {
      // Fallback for environments without streaming support
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Twitter video proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch video' });
  }
}

// Increase body size limit for video streaming
export const config = {
  api: {
    responseLimit: false,
  },
};
