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

interface CompletionState {
  status: Status;
  query: string;
  streamData: string;
  sources: Source[] | undefined;
  error: AskError | null;
}

interface UseAICompletionReturn extends CompletionState {
  submitQuery: (query: string) => Promise<void>;
  abort: () => void;
  reset: () => void;
}

const initialState: CompletionState = {
  status: 'initial',
  query: '',
  streamData: '',
  sources: undefined,
  error: null,
};

const useAICompletion = (
  options: UseAICompletionOptions = {}
): UseAICompletionReturn => {
  const { threshold = 0.25 } = options;

  const [state, setState] = useState(initialState);

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
    setState(initialState);
  }, [abort]);

  const submitQuery = useCallback(
    async (newQuery: string) => {
      // Abort any existing request before starting a new one
      abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({ ...initialState, query: newQuery, status: 'loading' });

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
          setState((previous) => ({
            ...previous,
            status: 'initial',
            error: {
              status: response.status,
              statusText: response.statusText,
            },
          }));
          return;
        }

        let accumulatedText = '';
        let lastPublishedAt = -Infinity;
        const publish = async (done = false) => {
          const { value } = await parsePartialJson(accumulatedText);
          if (controller.signal.aborted) return;

          const current = value as DeepPartial<ResponseData> | undefined;
          setState((previous) => {
            const streamData =
              typeof current?.answer === 'string'
                ? current.answer
                : previous.streamData;
            // Sources are only displayed once the answer is complete.
            const sources = done
              ? current?.sources?.filter(
                  (source): source is Source =>
                    typeof source?.title === 'string' &&
                    typeof source?.url === 'string'
                )
              : previous.sources;
            const status = done ? 'done' : previous.status;

            if (
              streamData === previous.streamData &&
              sources === previous.sources &&
              status === previous.status
            ) {
              return previous;
            }

            return { ...previous, streamData, sources, status };
          });
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

        await publish(true);
      } catch (err) {
        // Only set error if it's not an abort error
        if (
          !controller.signal.aborted &&
          err instanceof Error &&
          err.name !== 'AbortError'
        ) {
          setState((previous) => ({
            ...previous,
            status: 'initial',
            error: {
              status: 0,
              statusText: err.message || 'Network error',
            },
          }));
        }
      }
    },
    [abort, threshold]
  );

  return {
    ...state,
    submitQuery,
    abort,
    reset,
  };
};

export { useAICompletion };
export type { UseAICompletionReturn };
