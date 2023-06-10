import {
  Flex,
  Label,
  useDebouncedValue,
  useKeyboardShortcut,
  useTheme,
} from '@maximeheckel/design-system';
import FocusTrap from 'focus-trap-react';
import React from 'react';
import { createPortal } from 'react-dom';
import { CommandCenterStatic } from './CommandCenterStatic';
import {
  Overlay,
  SearchBox,
  FormWrapper,
  SearchInput,
  Wrapper,
} from './Styles';
import useBodyScrollLock from '@core/hooks/useBodyScrollLock';
import { AnimatePresence, motion } from 'framer-motion';
import { Result, SearchError, Status } from './types';
import SearchResults from './SearchResults';
import AIPromptResultCard from './AIPromptResultCard';
import AIPromptInput from './AIPromptInput';

interface Props {
  onClose: () => void;
  forceAIMode?: boolean;
}

const Search = (props: Props) => {
  const { onClose, forceAIMode = false } = props;

  // Search Related states
  const [status, setStatus] = React.useState<Status>('initial');
  const [results, setResults] = React.useState<Result[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [error, setError] = React.useState<SearchError | null>(null);

  // AI Related states
  const [AIMode, setAIMode] = React.useState(forceAIMode);
  const [AIQuery, setAIQuery] = React.useState('');
  const [streamData, setStreamData] = React.useState('');

  const ref = React.useRef<HTMLElement>();
  const readerRef = React.useRef<ReadableStreamDefaultReader>();
  const [mounted, setMounted] = React.useState(false);

  useBodyScrollLock();

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);

  const formRef = React.useRef<HTMLFormElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const resultCardRef = React.useRef<HTMLDivElement>(null);

  const clickOutside = (e: React.BaseSyntheticEvent) => {
    if (
      (searchRef &&
        searchRef.current &&
        searchRef.current.contains(e.target)) ||
      (resultCardRef &&
        resultCardRef.current &&
        resultCardRef.current.contains(e.target))
    ) {
      return null;
    }

    if (AIMode) {
      dismissAIMode();
    }
    return onClose();
  };

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
          threshold: 0.76,
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
      }),
      signal,
    });

    if (!response.ok) {
      setStatus('initial');
      setError({
        status: response.status,
        statusText: response.statusText,
      });
      return;
    }

    const data = response.body;

    if (!data) {
      return;
    }
    const reader = data.getReader();
    readerRef.current = reader;

    const decoder = new TextDecoder();
    let done = false;
    let text = '';
    while (!done) {
      const { value, done: doneReading } = await reader.read();

      if (typeof value === 'undefined') {
        reader.cancel();
        break;
      }

      done = doneReading;
      const chunkValue = decoder.decode(value);

      const invalidOutput = text.includes("Maxime hasn't written about it yet");
      if (invalidOutput) {
        break;
      }

      setStreamData((prev) => {
        text = prev + chunkValue;
        return prev + chunkValue;
      });
    }
    reader.cancel();
    setStatus('done');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  // Focus on input on mount
  React.useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle classic search (TODO: Refactor this => use simple embed search instead)
  React.useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery !== '') {
      querySemanticSearch(debouncedSearchQuery);
    }

    if (debouncedSearchQuery === '') {
      setResults([]);
      setStatus('initial');
    }
  }, [debouncedSearchQuery]);

  // Make portal only work client side
  React.useEffect(() => {
    ref.current = document.body;
    setMounted(true);
  }, []);

  useKeyboardShortcut('Escape', AIMode ? dismissAIMode : onClose);

  const { dark } = useTheme();

  return mounted
    ? createPortal(
        <FocusTrap>
          <aside>
            <Overlay
              initial={{
                backgroundColor: dark
                  ? 'rgba(0,0,0,0)'
                  : 'rgba(241, 243, 247, 0)',
              }}
              animate={{
                backgroundColor: dark
                  ? 'rgba(0,0,0,0.8)'
                  : 'rgba(241, 243, 247, 0.8)',
              }}
              exit={{
                backgroundColor: dark
                  ? 'rgba(0,0,0,0)'
                  : 'rgba(241, 243, 247, 0)',
              }}
              onClick={clickOutside}
              data-testid="search-overlay"
              aria-label="search"
              // The dialog container element has aria-modal set to true.
              aria-modal="true"
              tabIndex={-1}
              // All elements required to operate the dialog are descendants of the element that has role dialog.
              role="dialog"
            >
              <Wrapper>
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
                        status={status}
                        streamData={streamData}
                      />
                    ) : null}
                  </AnimatePresence>
                  <SearchBox
                    id="search-box"
                    as={motion.div}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      scale: 0.8,
                      opacity: 0,
                      transition: { duration: 0.15, delay: 0.1 },
                    }}
                    transition={{
                      ease: 'easeOut',
                      duration: 0.2,
                    }}
                    ref={searchRef}
                  >
                    <FormWrapper
                      data-testid="search"
                      style={
                        AIMode
                          ? {
                              borderBottomLeftRadius: 'var(--border-radius-2)',
                              borderBottomRightRadius: 'var(--border-radius-2)',
                              transition: 'all 0.2s ease-in-out',

                              transform: `scale(${
                                status === 'loading' ? 0.95 : 1
                              })`,
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
                            <SearchInput
                              ref={inputRef}
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
                              {debouncedSearchQuery !== '' &&
                              status !== 'loading'
                                ? `${results.length} results`
                                : null}
                            </Label>
                          </>
                        )}
                      </form>
                    </FormWrapper>
                    {debouncedSearchQuery !== '' ? (
                      <SearchResults results={results} onClose={onClose} />
                    ) : (
                      <CommandCenterStatic
                        collapse={AIMode}
                        onItemClick={handleItemClick}
                      />
                    )}
                  </SearchBox>
                </Flex>
              </Wrapper>
            </Overlay>
          </aside>
        </FocusTrap>,
        // @ts-ignore
        ref.current
      )
    : null;
};

export { Search };
