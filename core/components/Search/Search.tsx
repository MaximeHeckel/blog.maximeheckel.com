import { Dialog } from '@base-ui/react/dialog';
import {
  Flex,
  Label,
  useDebouncedValue,
  useKeyboardShortcut,
} from '@maximeheckel/design-system';
import { AnimatePresence, motion } from 'motion/react';
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ScreenReaderOnly } from '../ScreenReaderOnly';
import AIPromptInput from './AIPromptInput';
import AIPromptResultCard from './AIPromptResultCard';
import {
  CommandCenterNavigationRef,
  CommandCenterStatic,
} from './CommandCenterStatic';
import * as S from './Search.styles';
import SearchResults, { SearchResultsNavigationRef } from './SearchResults';
import { useAICompletion } from './useAICompletion';
import { useSemanticSearch } from './useSemanticSearch';

interface Props {
  open?: boolean;
  onClose: () => void;
  forceAIMode?: boolean;
}

const Search = (props: Props) => {
  const { onClose, forceAIMode = false, open } = props;

  // UI state
  const [AIMode, setAIMode] = useState(forceAIMode);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Navigation refs for keyboard handling
  const commandCenterRef = useRef<CommandCenterNavigationRef>(null);
  const searchResultsRef = useRef<SearchResultsNavigationRef>(null);

  // Custom hooks for search and AI completion
  const {
    status: searchStatus,
    results,
    error: searchError,
    search,
    reset: resetSearch,
  } = useSemanticSearch();

  const {
    status: aiStatus,
    query: aiQuery,
    streamData,
    sources,
    error: aiError,
    submitQuery,
    reset: resetAI,
  } = useAICompletion();

  // Derive combined status and error based on mode
  const status = AIMode ? aiStatus : searchStatus;
  const error = AIMode ? aiError : searchError;

  // Handle keyboard navigation at dialog level (inside focus trap)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Don't handle if in AI mode (no navigation needed)
      if (AIMode) return;

      const navRef =
        debouncedSearchQuery !== '' ? searchResultsRef : commandCenterRef;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          navRef.current?.previous();
          break;
        case 'ArrowDown':
          event.preventDefault();
          navRef.current?.next();
          break;
        case 'Enter':
          // Only handle Enter if not focused on the search input
          if ((event.target as HTMLElement).tagName !== 'INPUT') {
            event.preventDefault();
            navRef.current?.select();
          }
          break;
      }
    },
    [AIMode, debouncedSearchQuery]
  );

  const dismissAIMode = useCallback(() => {
    resetAI();
    setAIMode(false);
  }, [resetAI]);

  const onCloseHandler = useCallback(() => {
    resetAI();
    resetSearch();
    setAIMode(forceAIMode);
    setSearchQuery('');
    onClose();
  }, [forceAIMode, onClose, resetAI, resetSearch]);

  const handleItemClick = useCallback((item: string) => {
    if (item === 'aiMode') {
      setAIMode(true);
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const form = event?.currentTarget
        .elements as typeof event.currentTarget.elements & {
        aisearch: { value: string };
      };

      if (!AIMode || form.aisearch.value === '') return;

      submitQuery(form.aisearch.value);
      form.aisearch.value = '';
    },
    [AIMode, submitQuery]
  );

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery !== '') {
      search(debouncedSearchQuery);
    }

    if (debouncedSearchQuery === '') {
      resetSearch();
    }
  }, [debouncedSearchQuery, search, resetSearch]);

  useKeyboardShortcut('Escape', AIMode ? dismissAIMode : onCloseHandler);

  // Screen reader announcement for search results
  const getStatusAnnouncement = () => {
    if (status === 'loading') {
      return AIMode ? 'Generating AI response...' : 'Searching...';
    }
    if (status === 'done' && !AIMode && debouncedSearchQuery !== '') {
      return `${results.length} ${results.length === 1 ? 'result' : 'results'} found`;
    }
    if (error) {
      return `Error: ${error.statusText}`;
    }
    return '';
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCloseHandler();
        }
      }}
    >
      <Dialog.Portal>
        <S.Backdrop data-testid="search-overlay" />
        <S.Popup
          role="search"
          aria-label="Search dialog"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title render={<ScreenReaderOnly />}>Search</Dialog.Title>
          <Dialog.Description render={<ScreenReaderOnly />}>
            Search through blog posts or ask AI questions
          </Dialog.Description>

          {/* Live region for status announcements */}
          <ScreenReaderOnly aria-live="polite" aria-atomic="true">
            {getStatusAnnouncement()}
          </ScreenReaderOnly>

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
                  onQuestionSelect={submitQuery}
                  query={aiQuery}
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
                        aria-label="Search blog posts"
                        aria-describedby="search-status"
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          setSearchQuery(event.target.value);
                        }}
                        value={searchQuery}
                      />
                      <Label
                        id="search-status"
                        aria-live="polite"
                        style={{
                          textAlign: 'right',
                          paddingRight: '8px',
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
                <SearchResults
                  ref={searchResultsRef}
                  results={results}
                  onClose={onClose}
                  aria-busy={status === 'loading'}
                />
              ) : (
                <CommandCenterStatic
                  ref={commandCenterRef}
                  collapse={AIMode}
                  onItemClick={handleItemClick}
                />
              )}
            </S.SearchBox>
          </Flex>
        </S.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { Search };
