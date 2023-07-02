import { NewTweet } from '../types/tweet';

const fetchTweetData = async (ids: string[]): Promise<NewTweet[]> => {
  const results = [];

  for (const id of ids) {
    const response = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${id}`
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
