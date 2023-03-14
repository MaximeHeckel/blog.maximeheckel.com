type TweetMedia = {
  media_key: string;
  url?: string;
  preview_image_url: string;
  height: number;
  width: number;
  type: 'image' | 'video';
  variants: Array<{
    bit_rate?: number;
    content_type: string;
    url: string;
  }>;
};

export type RawTweetType = {
  includes: {
    media: TweetMedia[];
    users: Array<{
      verified: boolean;
      url: string;
      profile_image_url: string;
      protected: boolean;
      username: string;
      name: string;
      id: string;
    }>;
    tweets: TweetData[];
  };
  data: TweetData[];
};

export interface TweetData {
  text: string;
  type: string;
  referenced_tweets: TweetData[];
  public_metrics: {
    retweet_count?: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  created_at: string;
  attachments: {
    media_keys: string[];
  };
  id: string;
  author_id: string;
}

export interface TransformedTweet extends TweetData {
  author: {
    verified: boolean;
    url: string;
    profile_image_url: string;
    protected: boolean;
    username: string;
    name: string;
    id: string;
  };
  media: TweetMedia[];
  referenced_tweets: TransformedTweet[];
}
