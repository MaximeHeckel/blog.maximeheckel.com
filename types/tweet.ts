export interface NewTweet {
  __typename: string;
  lang: string;
  favorite_count: number;
  possibly_sensitive: boolean;
  created_at: string;
  display_text_range: [number, number];
  entities: {
    hashtags: string[];
    urls: string[];
    user_mentions: string[];
    symbols: string[];
    media: {
      display_url: string;
      expanded_url: string;
      indices: [number, number];
      url: string;
    }[];
  };
  id_str: string;
  text: string;
  user: {
    id_str: string;
    name: string;
    profile_image_url_https: string;
    screen_name: string;
    verified: boolean;
    is_blue_verified: boolean;
    profile_image_shape: string;
  };
  edit_control: {
    edit_tweet_ids: string[];
    editable_until_msecs: string;
    is_edit_eligible: boolean;
    edits_remaining: string;
  };
  mediaDetails: {
    display_url: string;
    expanded_url: string;
    ext_media_availability: {
      status: string;
    };
    indices: [number, number];
    media_url_https: string;
    original_info: {
      height: number;
      width: number;
      focus_rects: {
        x: number;
        y: number;
        w: number;
        h: number;
      }[];
    };
    sizes: {
      large: {
        h: number;
        resize: string;
        w: number;
      };
      medium: {
        h: number;
        resize: string;
        w: number;
      };
      small: {
        h: number;
        resize: string;
        w: number;
      };
      thumb: {
        h: number;
        resize: string;
        w: number;
      };
    };
    type: string;
    url: string;
    video_info?: {
      aspect_ratio: [number, number];
      duration_millis: number;
      variants: {
        bitrate?: number;
        content_type: string;
        url: string;
      }[];
    };
  }[];
  photos: {
    backgroundColor: {
      red: number;
      green: number;
      blue: number;
    };
    cropCandidates: {
      x: number;
      y: number;
      w: number;
      h: number;
    }[];
    expandedUrl: string;
    url: string;
    width: number;
    height: number;
  }[];
  conversation_count?: number;
  reply_count?: number;
  news_action_type: string;
  isEdited: boolean;
  isStaleEdit: boolean;
  quoted_tweet?: NewTweet;
}
