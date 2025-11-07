import {
  Flex,
  Label,
  useDebouncedValue,
  useKeyboardShortcut,
} from '@maximeheckel/design-system';
import * as Dialog from '@radix-ui/react-dialog';
import deepEqual from 'deep-eql';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { ScreenReaderOnly } from '../ScreenReaderOnly';
import AIPromptInput from './AIPromptInput';
import AIPromptResultCard from './AIPromptResultCard';
import { CommandCenterStatic } from './CommandCenterStatic';
import * as S from './Search.styles';
import SearchResults from './SearchResults';
import { Result, SearchError, Status } from './types';
import { DeepPartial, parsePartialJson } from './utils';

interface Props {
  open?: boolean;
  onClose: () => void;
  forceAIMode?: boolean;
}

const Search = (props: Props) => {
  const { onClose, forceAIMode = false, open } = props;

  // Search Related states
  const [status, setStatus] = useState<Status>('initial');
  const [results, setResults] = useState<Result[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<SearchError | null>(null);

  // AI Related states
  const [AIMode, setAIMode] = useState(forceAIMode);
  const [AIQuery, setAIQuery] = useState('');
  const [streamData, setStreamData] = useState('');
  const [sources, setSources] = useState<
    Array<{ title?: string; url?: string }> | undefined
  >(undefined);

  const readerRef = useRef<ReadableStreamDefaultReader>();

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);

  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const controller = new AbortController();
  const signal = controller.signal;

  const dismissAIMode = () => {
    setStatus('initial');
    controller.abort();
    if (readerRef.current) {
      readerRef.current.cancel();
    }
    setError(null);
    setAIMode(false);
    setAIQuery('');
    setStreamData('');
  };

  const onCloseHandler = () => {
    setAIMode(forceAIMode);
    setAIQuery('');
    setStreamData('');

    setError(null);
    setResults([]);
    setSearchQuery('');
    setStatus('initial');

    onClose();
  };

  const handleItemClick = (item: string) => {
    if (item === 'aiMode') {
      setAIMode(true);
    }
  };

  const querySemanticSearch = async (query: string) => {
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
          threshold: 0.35,
        }),
      });

      if (!response.ok) {
        setError({
          status: response.status,
          statusText: response.statusText,
        });
      }

      const data = await response.json();
      setResults(data);
      setStatus('done');
    } catch (error) {}
  };

  type ResponseData = {
    answer: string;
    sources: {
      title: string;
      url: string;
    }[];
  };

  const queryCompletionSemanticSearch = async (query: string) => {
    // Clear data
    setError(null);
    setStreamData('');
    // Show query of the user at the top of the result card
    setAIQuery(query);
    // Set status to loading to show rotating border
    setStatus('loading');

    const response = await fetch('/api/semanticsearch/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        // @ts-ignore
        mock: window.Cypress ? true : false,
        threshold: 0.35,
      }),
      signal,
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
              setSources(currentObject?.sources ?? (undefined as any));
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(
              'Error parsing AI answer as JSON:',
              error as Error,
              JSON.stringify(accumulatedText),
              '!!! Let Maxime know about it :) !!!'
            );
          }
        },
      })
    );

    setStatus('done');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const form = event?.currentTarget
      .elements as typeof event.currentTarget.elements & {
      aisearch: { value: string };
    };

    if (!AIMode || form.aisearch.value === '') return;

    setAIQuery(form.aisearch.value);

    queryCompletionSemanticSearch(form.aisearch.value);
    form.aisearch.value = '';
  };

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery !== '') {
      querySemanticSearch(debouncedSearchQuery);
    }

    if (debouncedSearchQuery === '') {
      setResults([]);
      setStatus('initial');
    }
  }, [debouncedSearchQuery]);

  useKeyboardShortcut('Escape', AIMode ? dismissAIMode : onCloseHandler);

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <S.Overlay data-testid="search-overlay" />
        <S.Content onInteractOutside={onCloseHandler}>
          <Dialog.Title asChild>
            <ScreenReaderOnly>Search</ScreenReaderOnly>
          </Dialog.Title>
          <Dialog.Description asChild>
            <ScreenReaderOnly>
              Search through blog posts or ask AI questions
            </ScreenReaderOnly>
          </Dialog.Description>
          <Flex
            css={{
              position: 'relative',
              flexDirection: 'column',
              '@media (max-width: 700px)': {
                flexDirection: 'column-reverse',
              },
            }}
            direction="column"
            gap="4"
          >
            <AnimatePresence>
              {AIMode ? (
                <AIPromptResultCard
                  error={error}
                  onQuestionSelect={(question) => {
                    queryCompletionSemanticSearch(question);
                  }}
                  query={AIQuery}
                  ref={resultCardRef}
                  sources={sources}
                  status={status}
                  streamData={streamData}
                />
              ) : null}
            </AnimatePresence>
            <S.SearchBox
              id="search-box"
              as={motion.div}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                ease: 'easeOut',
                duration: 0.2,
              }}
              ref={searchRef}
            >
              <S.FormWrapper
                data-testid="search"
                style={
                  AIMode
                    ? {
                        borderBottomLeftRadius: 'var(--border-radius-2)',
                        borderBottomRightRadius: 'var(--border-radius-2)',
                        transition: 'all 0.2s ease-in-out',

                        transform: `scale(${status === 'loading' ? 0.95 : 1})`,
                        opacity: status === 'loading' ? 0.8 : 1,
                      }
                    : {}
                }
              >
                <form ref={formRef} onSubmit={handleSubmit}>
                  {AIMode ? (
                    <AIPromptInput status={status} />
                  ) : (
                    <>
                      <S.SearchInput
                        autoComplete="off"
                        type="search"
                        placeholder="Type keywords to search blog posts..."
                        data-testid="search-input"
                        id="search-input"
                        name="search"
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                        value={searchQuery}
                      />
                      <Label
                        style={{
                          width: '120px',
                        }}
                      >
                        {debouncedSearchQuery !== '' && status !== 'loading'
                          ? `${results.length} results`
                          : null}
                      </Label>
                    </>
                  )}
                </form>
              </S.FormWrapper>
              {debouncedSearchQuery !== '' ? (
                <SearchResults results={results} onClose={onClose} />
              ) : (
                <CommandCenterStatic
                  collapse={AIMode}
                  onItemClick={handleItemClick}
                />
              )}
            </S.SearchBox>
          </Flex>
        </S.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { Search };
