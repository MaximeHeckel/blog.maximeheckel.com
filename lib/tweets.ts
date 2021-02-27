import qs from 'qs';
import { RawTweetType, TransformedTweet, TweetData } from '../types/tweet';

export const getTweets = async (ids: string[]) => {
  const queryParams = qs.stringify({
    ids: ids.join(','),
    expansions:
      'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
    'tweet.fields':
      'attachments,author_id,public_metrics,created_at,id,in_reply_to_user_id,referenced_tweets,text',
    'user.fields': 'id,name,profile_image_url,protected,url,username,verified',
    'media.fields':
      'duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics',
  });

  const response = await fetch(
    `https://api.twitter.com/2/tweets?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_KEY}`,
      },
    }
  );

  const tweets = (await response.json()) as RawTweetType;

  const getAuthorInfo = (author_id: string) => {
    return tweets.includes.users.find((user) => user.id === author_id)!;
  };

  const getReferencedTweets = (mainTweet: TweetData) => {
    return (
      mainTweet?.referenced_tweets?.map((referencedTweet) => {
        const fullReferencedTweet = tweets.includes.tweets.find(
          (tweet) => tweet.id === referencedTweet.id
        )!;

        return {
          ...fullReferencedTweet,
          type: referencedTweet.type,
          author: getAuthorInfo(fullReferencedTweet.author_id),
        };
      }) || []
    );
  };

  return tweets.data.reduce(
    (allTweets: Record<string, TransformedTweet>, tweet: TweetData) => {
      const tweetWithAuthor = {
        ...tweet,
        media:
          tweet?.attachments?.media_keys.map((key) =>
            tweets.includes.media.find((media) => media.media_key === key)
          ) || [],
        referenced_tweets: getReferencedTweets(tweet),
        author: getAuthorInfo(tweet.author_id),
      };

      // @ts-ignore @MaximeHeckel: somehow media types are conflicting
      allTweets[tweet.id] = tweetWithAuthor;

      return allTweets;
    },
    {} as Record<string, TransformedTweet>
  );
};
