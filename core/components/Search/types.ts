export type Result = {
  type: 'snippet' | 'blogPost';
  slug: string;
  title: string;
};

export type Source = {
  title: string;
  url: string;
};

export type SearchError = {
  status: number;
  statusText: string;
};

export type Status = 'initial' | 'loading' | 'done';
