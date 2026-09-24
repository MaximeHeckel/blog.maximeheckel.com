export type Result = {
  url: string;
  title: string;
};

export type ArticleSearchResult = Result & {
  date: string;
};

export type SearchError = {
  status: number;
  statusText: string;
};

export type Status = 'initial' | 'loading' | 'done';
