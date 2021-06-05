import { css } from '@emotion/react';
import styled from '@emotion/styled';
import FocusTrap from 'focus-trap-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import ReactDOM from 'react-dom';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { useTheme } from '../../context/ThemeContext';
import { EnterIcon } from '../Icons';
import { CommandCenterStatic } from './CommandCenterStatic';

const MAX_HEIGHT = 455;

const toggleLockScroll = () => {
  document.documentElement.classList.toggle('lock-scroll');
  return;
};

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
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [results, setResults] = React.useState<Result[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
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

    toggleLockScroll();

    return () => toggleLockScroll();
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

  return ReactDOM.createPortal(
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
              <form
                onSubmit={(e) => e.preventDefault()}
                css={css`
                  border-bottom: ${debouncedSearchQuery
                    ? `1px solid ${
                        dark
                          ? 'hsla(var(--palette-gray-100), 100%)'
                          : 'hsla(var(--palette-gray-10), 100%)'
                      }`
                    : 'none'};
                `}
              >
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
                <div
                  css={css`
                    width: 120px;
                    color: var(--maximeheckel-colors-typeface-2);
                    font-size: 14px;
                    font-weight: 500;
                    opacity: 0.8;
                  `}
                >
                  {debouncedSearchQuery !== '' && !loading
                    ? `${results.length} results`
                    : null}
                </div>
              </form>
            </FormWrapper>
            {debouncedSearchQuery !== '' ? (
              <SearchResults
                height={
                  results.length * 65 >= MAX_HEIGHT
                    ? MAX_HEIGHT
                    : results.length * 65
                }
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
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-left: 16px;
                        height: 35px;
                        width: 35px;
                        background-color: var(--maximeheckel-colors-emphasis);
                        border-radius: var(--border-radius-1);

                        path {
                          stroke: var(--maximeheckel-colors-brand);
                        }
                      `}
                    >
                      <EnterIcon />
                    </div>
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

const Result = styled(motion.li)<{ selected: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  list-style: none;
  color: var(--maximeheckel-colors-typeface-1);
  padding: 10px 25px;
  height: 65px;

  a {
    color: unset;
    display: block;
    width: 500px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
  }

  > div {
    opacity: 0;
  }

  ${(p) =>
    p.selected
      ? `
  background-color: var(--maximeheckel-colors-foreground);
  a {
    color: var(--maximeheckel-colors-brand);
  }
  > div {
    opacity: 1;
  }
  `
      : ''}
`;

const SearchResults = styled('ul')<{ height?: number }>`
  @media (max-width: 700px) {
    max-height: 450px;
  }

  background: var(--maximeheckel-colors-body);
  max-height: ${MAX_HEIGHT}px;
  height: ${(p) => p.height || 0}px;
  overflow: auto;
  margin: 0px;
  transition: height 0.4s ease-out;
  will-change: height;
`;

const SearchBox = styled(motion.div)`
  position: fixed;
  overflow: hidden;
  width: 600px;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: var(--border-radius-2);
  box-shadow: var(--maximeheckel-shadow-1);

  @media (max-width: 700px) {
    width: 100%;
    top: 0;
    border-radius: 0px;
  }
`;

const FormWrapper = styled('div')`
  background: var(--maximeheckel-colors-body);

  form {
    margin: 0px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  input {
    background: transparent;
    border: none;
    font-weight: 300;
    height: 55px;
    padding: 0px 25px;
    width: 100%;
    outline: none;
    color: var(--maximeheckel-colors-typeface-0);
    ::placeholder,
    ::-webkit-input-placeholder {
      color: var(--maximeheckel-colors-typeface-1);
    }
    :-ms-input-placeholder {
      color: var(--maximeheckel-colors-typeface-1);
    }

    -webkit-appearance: textfield;
    outline-offset: -2px;

    ::-webkit-search-cancel-button,
    ::-webkit-search-decoration {
      -webkit-appearance: none;
    }
    ::-webkit-input-placeholder {
      color: inherit;
      opacity: 0.54;
    }
    ::-webkit-file-upload-button {
      -webkit-appearance: button;
      font: inherit;
    }

    ::-webkit-autofill {
      background: transparent;
      color: var(--maximeheckel-colors-typeface-0);
      font-size: 14px;
    }
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  outline: none;
`;
