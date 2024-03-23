import { NewTweet } from '../types/tweet';

const fetchTweetData = async (ids: string[]): Promise<NewTweet[]> => {
  const results = [];

  for (const id of ids) {
    // Note: if the URL breaks, you can find a new one by inspecting the
    // network tab in the browser dev tools when you load a tweet embed.
    const response = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?features=tfw_timeline_list%3A%3Btfw_follower_count_sunset%3Atrue%3Btfw_tweet_edit_backend%3Aon%3Btfw_refsrc_session%3Aon%3Btfw_fosnr_soft_interventions_enabled%3Aon%3Btfw_mixed_media_15897%3Atreatment%3Btfw_experiments_cookie_expiration%3A1209600%3Btfw_show_birdwatch_pivots_enabled%3Aon%3Btfw_duplicate_scribes_to_settings%3Aon%3Btfw_use_profile_image_shape_enabled%3Aon%3Btfw_video_hls_dynamic_manifests_15082%3Atrue_bitrate%3Btfw_legacy_timeline_sunset%3Atrue%3Btfw_tweet_edit_frontend%3Aon&id=${id}&lang=en&token=3cyaf2vcqn&eb3f6q=2588b53yicua&0eh2pi=1lfg9890gni9&gea2ck=67k8rdg7w11v&oexftn=b507q82p8zr&thcu8n=de2yw8ys85pr&nqstp6=6p8ocgf8lbcu`
    );

    try {
      const tweet = (await response.json()) as NewTweet;

      results.push(tweet);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching tweet ${id}`, error);
    }
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
