import { useCallback, useEffect, useRef, useState } from 'react';

import { Result, SearchError, Status } from './types';

interface UseSemanticSearchOptions {
  threshold?: number;
  debounceMs?: number;
}

interface UseSemanticSearchReturn {
  status: Status;
  results: Result[];
  error: SearchError | null;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

const useSemanticSearch = (
  options: UseSemanticSearchOptions = {}
): UseSemanticSearchReturn => {
  const { threshold = 0.35 } = options;

  const [status, setStatus] = useState<Status>('initial');
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<SearchError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const search = useCallback(
    async (query: string) => {
      // Abort any existing request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setError(null);
      setStatus('loading');

      try {
        const response = await fetch('/api/semanticsearch/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            completion: false,
            threshold,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          setError({
            status: response.status,
            statusText: response.statusText,
          });
          setStatus('done');
          return;
        }

        const data = await response.json();
        setResults(data);
        setStatus('done');
      } catch (err) {
        // Only set error if it's not an abort error
        if (err instanceof Error && err.name !== 'AbortError') {
          setError({
            status: 0,
            statusText: err.message || 'Network error',
          });
          setStatus('done');
        }
      }
    },
    [threshold]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setResults([]);
    setStatus('initial');
    setError(null);
  }, []);

  return { status, results, error, search, reset };
};

export { useSemanticSearch };
export type { UseSemanticSearchReturn };
