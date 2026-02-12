import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import { fileURLToPath } from 'url';

/* eslint-disable no-console */
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = process.cwd();
const OUTPUT_DIR = path.join(root, 'twitter_video_out');

// Regex to find all the custom static tweets in a MDX file
const TWEET_RE = /<StaticTweet\sid="[0-9]+"\s\/>/g;

/**
 * Fetch tweet data from Twitter's syndication API
 */
const fetchTweetData = async (id) => {
  const response = await fetch(
    `https://cdn.syndication.twimg.com/tweet-result?features=tfw_timeline_list%3A%3Btfw_follower_count_sunset%3Atrue%3Btfw_tweet_edit_backend%3Aon%3Btfw_refsrc_session%3Aon%3Btfw_fosnr_soft_interventions_enabled%3Aon%3Btfw_mixed_media_15897%3Atreatment%3Btfw_experiments_cookie_expiration%3A1209600%3Btfw_show_birdwatch_pivots_enabled%3Aon%3Btfw_duplicate_scribes_to_settings%3Aon%3Btfw_use_profile_image_shape_enabled%3Aon%3Btfw_video_hls_dynamic_manifests_15082%3Atrue_bitrate%3Btfw_legacy_timeline_sunset%3Atrue%3Btfw_tweet_edit_frontend%3Aon&id=${id}&lang=en&token=2ytl21pjort&aou6il=m01p8epav57j&itik4d=2to3ik84aemw&cqgdx4=167u58h8h50u&c38lyv=fxl8osb7uj88&how97j=4uew8qdzphyf&umggaa=167u58h8h50u`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tweet ${id}: ${response.status}`);
  }

  return response.json();
};

/**
 * Extract tweet IDs from MDX files
 * @param {string|null} targetFile - Optional specific MDX file to process
 */
const extractTweetIds = (targetFile = null) => {
  const contentDir = path.join(root, 'content');

  let files;
  if (targetFile) {
    // Normalize the filename (add .mdx if not present)
    const filename = targetFile.endsWith('.mdx')
      ? targetFile
      : `${targetFile}.mdx`;
    const filePath = path.join(contentDir, filename);

    if (!fs.existsSync(filePath)) {
      console.error(chalk.red('error'), ` - File not found: ${filePath}`);
      process.exit(1);
    }

    files = [filename];
  } else {
    files = fs.readdirSync(contentDir).filter((name) => name.endsWith('.mdx'));
  }

  const tweetIds = new Set();

  for (const file of files) {
    const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const matches = content.match(TWEET_RE);

    if (matches) {
      for (const match of matches) {
        const id = match.match(/[0-9]+/g)?.[0];
        if (id) {
          tweetIds.add(id);
        }
      }
    }
  }

  return Array.from(tweetIds);
};

/**
 * Get the highest bitrate MP4 video URL from a tweet
 */
const getVideoUrl = (tweet) => {
  if (!tweet.mediaDetails || tweet.mediaDetails.length === 0) {
    return null;
  }

  for (const media of tweet.mediaDetails) {
    if (media.type === 'video' && media.video_info?.variants) {
      const mp4Variants = media.video_info.variants.filter(
        (v) => v.content_type === 'video/mp4'
      );

      if (mp4Variants.length === 0) {
        return null;
      }

      // Get highest bitrate variant
      const bestVariant = mp4Variants.reduce((max, variant) => {
        return (variant.bitrate || 0) > (max.bitrate || 0) ? variant : max;
      }, mp4Variants[0]);

      return bestVariant.url;
    }
  }

  return null;
};

/**
 * Download a video file
 */
const downloadVideo = async (url, outputPath) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://twitter.com/',
      Origin: 'https://twitter.com',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status}`);
  }

  const fileStream = fs.createWriteStream(outputPath);

  await new Promise((resolve, reject) => {
    const _writableStream = new Writable({
      write(chunk, encoding, callback) {
        fileStream.write(chunk, callback);
      },
    });

    response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          return new Promise((res, rej) => {
            fileStream.write(chunk, (err) => {
              if (err) rej(err);
              else res();
            });
          });
        },
        close() {
          fileStream.end();
          resolve();
        },
        abort(err) {
          fileStream.destroy(err);
          reject(err);
        },
      })
    );
  });
};

(async () => {
  // Parse command line argument for optional file filter
  const targetFile = process.argv[2] || null;

  if (targetFile) {
    console.info(
      chalk.cyan('info'),
      ` - Downloading Twitter videos from: ${targetFile}`
    );
  } else {
    console.info(
      chalk.cyan('info'),
      ` - Downloading Twitter videos from all MDX files`
    );
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.info(
      chalk.cyan('info'),
      ` - Created output directory: ${OUTPUT_DIR}`
    );
  }

  try {
    // Extract tweet IDs from MDX files
    const tweetIds = extractTweetIds(targetFile);
    console.info(
      chalk.cyan('info'),
      ` - Found ${tweetIds.length} tweets${targetFile ? ` in ${targetFile}` : ''}`
    );

    let downloadCount = 0;
    let skippedCount = 0;
    let noVideoCount = 0;

    for (const id of tweetIds) {
      const outputPath = path.join(OUTPUT_DIR, `${id}.mp4`);

      // Skip if already downloaded
      if (fs.existsSync(outputPath)) {
        skippedCount++;
        continue;
      }

      try {
        // Fetch tweet data
        const tweet = await fetchTweetData(id);

        // Get video URL
        const videoUrl = getVideoUrl(tweet);

        if (!videoUrl) {
          noVideoCount++;
          continue;
        }

        console.info(chalk.yellow('downloading'), ` - Tweet ${id}`);

        // Download the video
        await downloadVideo(videoUrl, outputPath);

        downloadCount++;
        console.info(chalk.green('success'), ` - Downloaded ${id}.mp4`);
      } catch (error) {
        console.error(
          chalk.red('error'),
          ` - Failed to process tweet ${id}:`,
          error.message
        );
      }
    }

    console.info(chalk.cyan('info'), ` - Summary:`);
    console.info(`   - Downloaded: ${downloadCount} videos`);
    console.info(`   - Skipped (already exists): ${skippedCount} videos`);
    console.info(`   - No video content: ${noVideoCount} tweets`);
  } catch (error) {
    console.error(
      chalk.red('error'),
      ` - An error occurred while downloading Twitter videos`
    );
    console.error(error);
    process.exit(1);
  }
})();
