import { useCallback, useRef, useState } from 'react';

import { Result, SearchError, Status } from './types';

interface UseArticleSearchReturn {
  status: Status;
  results: Result[];
  error: SearchError | null;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

export function useArticleSearch(): UseArticleSearchReturn {
  const [status, setStatus] = useState<Status>('initial');
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<SearchError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    abortControllerRef.current?.abort();
    if (query.trim().length < 3) {
      setResults([]);
      setStatus('initial');
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('loading');
    setResults([]);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const articles: Array<{ title: string; path: string }> =
        await response.json();
      if (controller.signal.aborted) return;
      setResults(articles.map(({ title, path }) => ({ title, url: path })));
      setStatus('done');
    } catch (err) {
      if (
        !controller.signal.aborted &&
        err instanceof Error &&
        err.name !== 'AbortError'
      ) {
        setError({ status: 0, statusText: err.message });
        setStatus('done');
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setResults([]);
    setStatus('initial');
    setError(null);
  }, []);

  return { status, results, error, search, reset };
}
