import deepEqual from 'deep-eql';
import { DeepPartial, parsePartialJson } from 'lib/partialJson';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AskError, Source, Status } from './types';

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
  error: AskError | null;
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
  const [error, setError] = useState<AskError | null>(null);

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
      const controller = new AbortController();
      abortControllerRef.current = controller;

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
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (!response.ok || !response.body) {
          setStatus('initial');
          setError({
            status: response.status,
            statusText: response.statusText,
          });
          return;
        }

        let accumulatedText = '';
        let lastPublishedAt = -Infinity;
        let latestSources: Source[] | undefined;

        const publish = async () => {
          const { value } = await parsePartialJson(accumulatedText);
          if (controller.signal.aborted || !value) return;

          const current = value as DeepPartial<ResponseData>;
          if (typeof current.answer === 'string') {
            setStreamData(current.answer);
          }
          const nextSources = current.sources?.filter(
            (source): source is Source =>
              typeof source?.title === 'string' &&
              typeof source?.url === 'string'
          );
          if (!deepEqual(latestSources, nextSources)) {
            latestSources = nextSources;
            setSources(nextSources);
          }
          lastPublishedAt = performance.now();
        };

        await response.body.pipeThrough(new TextDecoderStream()).pipeTo(
          new WritableStream({
            async write(chunk) {
              accumulatedText += chunk;
              // Coalesce fast token bursts; always flush the complete answer below.
              if (performance.now() - lastPublishedAt >= 50) await publish();
            },
          }),
          { signal: controller.signal }
        );

        await publish();
        if (controller.signal.aborted) return;
        setStatus('done');
      } catch (err) {
        // Only set error if it's not an abort error
        if (
          !controller.signal.aborted &&
          err instanceof Error &&
          err.name !== 'AbortError'
        ) {
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
