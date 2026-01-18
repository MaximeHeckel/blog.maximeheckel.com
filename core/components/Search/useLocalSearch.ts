import { useCallback, useRef, useState } from 'react';

import { Result, SearchError, Status } from './types';

interface UseLocalSearchReturn {
  status: Status;
  results: Result[];
  error: SearchError | null;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

export function useLocalSearch(): UseLocalSearchReturn {
  const [status, setStatus] = useState<Status>('initial');
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<SearchError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setStatus('initial');
      return;
    }

    if (query.length < 3) {
      setResults([]);
      setStatus('initial');
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const hits = await response.json();
      setResults(
        hits.map((h: { title: string; url: string }) => ({
          title: h.title,
          url: h.url,
        }))
      );
      setStatus('done');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
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
