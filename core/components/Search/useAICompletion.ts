import deepEqual from 'deep-eql';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SearchError, Source, Status } from './types';
import { DeepPartial, parsePartialJson } from './utils';

interface UseAICompletionOptions {
  threshold?: number;
}

interface ResponseData {
  answer: string;
  sources: Source[];
}

interface UseAICompletionReturn {
  status: Status;
  query: string;
  streamData: string;
  sources: Source[] | undefined;
  error: SearchError | null;
  submitQuery: (query: string) => Promise<void>;
  abort: () => void;
  reset: () => void;
}

const useAICompletion = (
  options: UseAICompletionOptions = {}
): UseAICompletionReturn => {
  const { threshold = 0.25 } = options;

  const [status, setStatus] = useState<Status>('initial');
  const [query, setQuery] = useState('');
  const [streamData, setStreamData] = useState('');
  const [sources, setSources] = useState<Source[] | undefined>(undefined);
  const [error, setError] = useState<SearchError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abort();
    setStatus('initial');
    setQuery('');
    setStreamData('');
    setSources(undefined);
    setError(null);
  }, [abort]);

  const submitQuery = useCallback(
    async (newQuery: string) => {
      // Abort any existing request before starting a new one
      abort();
      abortControllerRef.current = new AbortController();

      // Clear previous data
      setError(null);
      setStreamData('');
      setSources(undefined);
      // Show query of the user at the top of the result card
      setQuery(newQuery);
      // Set status to loading to show rotating border
      setStatus('loading');

      try {
        const response = await fetch('/api/semanticsearch/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: newQuery,
            // @ts-ignore - Cypress detection for e2e tests
            mock: window.Cypress ? true : false,
            threshold,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok || !response.body) {
          setStatus('initial');
          setError({
            status: response.status,
            statusText: response.statusText,
          });
          return;
        }

        let accumulatedText = '';
        let latestObject: DeepPartial<ResponseData> | undefined = undefined;

        await response.body.pipeThrough(new TextDecoderStream()).pipeTo(
          new WritableStream({
            async write(chunk) {
              accumulatedText += chunk;

              try {
                const { value } = await parsePartialJson(accumulatedText);

                const currentObject = value as DeepPartial<ResponseData>;

                if (!deepEqual(latestObject, currentObject)) {
                  setStreamData(currentObject?.answer ?? '');
                  latestObject = currentObject;
                  setSources(currentObject?.sources as Source[] | undefined);
                }
              } catch (parseError) {
                // eslint-disable-next-line no-console
                console.error(
                  'Error parsing AI answer as JSON:',
                  parseError as Error,
                  JSON.stringify(accumulatedText),
                  '!!! Let Maxime know about it :) !!!'
                );
              }
            },
          }),
          { signal: abortControllerRef.current.signal }
        );

        setStatus('done');
      } catch (err) {
        // Only set error if it's not an abort error
        if (err instanceof Error && err.name !== 'AbortError') {
          setStatus('initial');
          setError({
            status: 0,
            statusText: err.message || 'Network error',
          });
        }
      }
    },
    [abort, threshold]
  );

  return {
    status,
    query,
    streamData,
    sources,
    error,
    submitQuery,
    abort,
    reset,
  };
};

export { useAICompletion };
export type { UseAICompletionReturn };

