export type Source = {
  title: string;
  url: string;
};

export type AskError = {
  status: number;
  statusText: string;
};

export type Status = 'initial' | 'loading' | 'done';
