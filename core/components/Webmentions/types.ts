export interface RepliesProps {
  replies: Reply[];
}

export type Reply = {
  source: URL;
  target: URL;
  verified: boolean;
  verified_date: string;
  id: number;
  private: boolean;
  activity: {
    type: string;
    sentence: string;
    sentence_html: string;
  };
  data: {
    author: {
      name: string;
      url: string;
      photo: string;
    };
    url: string;
  };
};
