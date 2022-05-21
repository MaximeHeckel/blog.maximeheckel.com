import {
  Flex,
  Icon,
  Label,
  useDebouncedValue,
  useTheme,
} from '@maximeheckel/design-system';
import FocusTrap from 'focus-trap-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { createPortal } from 'react-dom';
import { CommandCenterStatic } from './CommandCenterStatic';
import { HEIGHT, MAX_HEIGHT } from './constants';
import {
  Overlay,
  SearchBox,
  FormWrapper,
  SearchResults,
  Result,
} from './Styles';
import useBodyScrollLock from '@theme/hooks/useBodyScrollLock';

type Result = {
  type: 'snippet' | 'blogPost';
  slug: string;
  title: string;
};

interface Props {
  onClose: () => void;
}

export type IndexOperator = (nudge?: number) => void;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const wrap = (value: number, min: number, max: number) => {
  const range = max - min;

  return ((((value - min) % range) + range) % range) + min;
};

function useIndexItem<T>(
  items: T[],
  initial = 0
): [
  T,
  IndexOperator,
  IndexOperator,
  React.Dispatch<React.SetStateAction<number>>
] {
  const [index, setIndex] = React.useState(initial);
  const itemsRef = React.useRef(items);

  React.useEffect(() => {
    itemsRef.current = items;

    setIndex((index) => clamp(index, 0, Math.max(items.length - 1, 0)));
  }, [items]);

  const previousItem = React.useCallback((nudge: number = 1) => {
    setIndex((index) =>
      wrap(index - nudge, 0, Math.max(itemsRef.current.length, 0))
    );
  }, []);

  const nextItem = React.useCallback((nudge: number = 1) => {
    setIndex((index) =>
      wrap(index + nudge, 0, Math.max(itemsRef.current.length, 0))
    );
  }, []);

  return [items[index], previousItem, nextItem, setIndex];
}

const Search = (props: Props) => {
  const { onClose } = props;

  const [loading, setLoading] = React.useState(true);
  const [results, setResults] = React.useState<Result[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  useBodyScrollLock();
  const router = useRouter();
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const SearchRef = React.useRef<HTMLDivElement>(null);

  const [
    selectedResult,
    previousResult,
    nextResult,
    setSelectedResult,
  ] = useIndexItem(results);

  const clickOutside = (e: React.BaseSyntheticEvent) => {
    if (
      SearchRef &&
      SearchRef.current &&
      SearchRef.current.contains(e.target)
    ) {
      return null;
    }

    return onClose();
  };

  const handlePointer = (index: number) => setSelectedResult(index);

  const handleKey = React.useCallback(
    (event: KeyboardEvent) => {
      if (debouncedSearchQuery !== '') {
        switch (event.key) {
          case 'Enter':
            const href = `/${
              selectedResult.type === 'snippet' ? 'snippets' : 'posts'
            }/${selectedResult.slug}/`;
            router.push(href).then(() => window.scrollTo(0, 0));
            setTimeout(onClose, 600);
            break;
          case 'ArrowUp':
            event.preventDefault();
            previousResult();
            break;
          case 'ArrowDown':
            event.preventDefault();
            nextResult();
            break;
          default:
        }
      }
    },
    [
      debouncedSearchQuery,
      selectedResult,
      router,
      onClose,
      previousResult,
      nextResult,
    ]
  );

  React.useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }

    // toggleLockScroll();

    // return () => toggleLockScroll();
  }, []);

  React.useEffect(() => {
    setLoading(true);

    if (debouncedSearchQuery && debouncedSearchQuery !== '') {
      const searchEndpoint = `/api/search?q=${debouncedSearchQuery.toLowerCase()}`;
      fetch(searchEndpoint)
        .then((res) => res.json())
        .then((res) => {
          setResults(res.results);
          setLoading(false);
        });
    }

    if (debouncedSearchQuery === '') {
      setResults([]);
      setLoading(false);
    }
  }, [debouncedSearchQuery]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleKey]);

  React.useEffect(() => {
    if (selectedResult) {
      document
        .getElementById(selectedResult.slug)
        ?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedResult]);

  const { dark } = useTheme();

  return createPortal(
    <FocusTrap>
      <aside>
        <Overlay
          initial={{
            backgroundColor: dark ? 'rgba(0,0,0,0)' : 'rgba(241, 243, 247, 0)',
          }}
          animate={{
            backgroundColor: dark
              ? 'rgba(0,0,0,0.8)'
              : 'rgba(241, 243, 247, 0.8)',
          }}
          exit={{
            backgroundColor: dark ? 'rgba(0,0,0,0)' : 'rgba(241, 243, 247, 0)',
          }}
          // transition={{ duration: 0.4 }}
          onClick={clickOutside}
          data-testid="search-overlay"
          aria-label="search"
          // The dialog container element has aria-modal set to true.
          aria-modal="true"
          tabIndex={-1}
          // All elements required to operate the dialog are descendants of the element that has role dialog.
          role="dialog"
        >
          <SearchBox
            initial={{ scale: 0.8, opacity: 0, x: '-50%' }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0.5,
              opacity: 0,
              transition: { duration: 0.15, delay: 0.1 },
            }}
            transition={{
              ease: 'easeOut',
              duration: 0.2,
            }}
          >
            <FormWrapper data-testid="search" ref={SearchRef}>
              <form onSubmit={(e) => e.preventDefault()}>
                <input
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
                  {debouncedSearchQuery !== '' && !loading
                    ? `${results.length} results`
                    : null}
                </Label>
              </form>
            </FormWrapper>
            {debouncedSearchQuery !== '' ? (
              <SearchResults
                style={{
                  height:
                    results.length * HEIGHT >= MAX_HEIGHT
                      ? MAX_HEIGHT
                      : results.length * HEIGHT,
                  transition: 'height 0.4s ease-out',
                  willChange: 'height',
                }}
              >
                {results.map((result, index) => (
                  <Result
                    data-testid="search-result"
                    key={result.slug}
                    id={result.slug}
                    selected={selectedResult === result}
                    onPointerEnter={() => handlePointer(index)}
                  >
                    <Link
                      href={`/${
                        result.type === 'snippet' ? 'snippets' : 'posts'
                      }/${result.slug}`}
                    >
                      <a onClick={() => setTimeout(onClose, 600)}>
                        {result.title}
                      </a>
                    </Link>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      css={{
                        marginLeft: 'var(--space-4)',
                        height: '35px',
                        width: '35px',
                        backgroundColor: 'var(--maximeheckel-colors-emphasis)',
                        borderRadius: 'var(--border-radius-1)',

                        path: {
                          stroke: 'var(--maximeheckel-colors-brand)',
                        },
                      }}
                    >
                      <Icon.Enter size={4} />
                    </Flex>
                  </Result>
                ))}
              </SearchResults>
            ) : (
              <CommandCenterStatic />
            )}
          </SearchBox>
        </Overlay>
      </aside>
    </FocusTrap>,
    document.body
  );
};

export { Search };
