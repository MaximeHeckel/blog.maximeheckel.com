import { NewTweet } from '../types/tweet';

const fetchTweetData = async (ids: string[]): Promise<NewTweet[]> => {
  const results = [];

  for (const id of ids) {
    // Note: if the URL breaks, you can find a new one by inspecting the
    // network tab in the browser dev tools when you load a tweet embed.
    const response = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?features=tfw_timeline_list%3A%3Btfw_follower_count_sunset%3Atrue%3Btfw_tweet_edit_backend%3Aon%3Btfw_refsrc_session%3Aon%3Btfw_fosnr_soft_interventions_enabled%3Aon%3Btfw_mixed_media_15897%3Atreatment%3Btfw_experiments_cookie_expiration%3A1209600%3Btfw_show_birdwatch_pivots_enabled%3Aon%3Btfw_duplicate_scribes_to_settings%3Aon%3Btfw_use_profile_image_shape_enabled%3Aon%3Btfw_video_hls_dynamic_manifests_15082%3Atrue_bitrate%3Btfw_legacy_timeline_sunset%3Atrue%3Btfw_tweet_edit_frontend%3Aon&id=${id}&lang=en&token=434ts2qf9ae&7ff376=jd686m35gpde&d7bx8p=19ywn80rre4d&y0oda5=6lv8zc4av8oi&pjl0c8=1njzv8bkrlsq&motl31=201a8pipthnh`
    );

    const tweet = (await response.json()) as NewTweet;

    results.push(tweet);
  }

  return results;
};

export const getTweets = async (ids: string[]) => {
  try {
    const tweets = await fetchTweetData(ids);

    const data = tweets.reduce(
      (allTweets: Record<string, NewTweet>, tweet: NewTweet) => {
        allTweets[tweet.id_str] = tweet;

        return allTweets;
      },
      {} as Record<string, NewTweet>
    );

    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Error] - getTweets:', e);
  }
};
