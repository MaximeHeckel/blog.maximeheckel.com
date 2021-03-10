import { css } from '@emotion/react';
import styled from '@emotion/styled';
import FocusTrap from 'focus-trap-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import ReactDOM from 'react-dom';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { useTheme } from '../../context/ThemeContext';
import VisuallyHidden from '../VisuallyHidden';
import {
  ContactIcon,
  EnterIcon,
  PortfolioIcon,
  RSSIcon,
  TwitterIcon,
} from '../Icons';

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

const Search: React.FC<Props> = (props) => {
  const { onClose } = props;
  const router = useRouter();

  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [prevHeight, setPrevHeight] = React.useState(0);
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
      if (mounted && debouncedSearchQuery !== '') {
        switch (event.key) {
          case 'Enter':
            const href = `/${
              selectedResult.type === 'snippet' ? 'snippets' : 'posts'
            }/${selectedResult.slug}/`;
            router.push(href).then(() => window.scrollTo(0, 0));
            onClose();
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
      mounted,
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
          setPrevHeight(Math.min(res.results.length * 65, MAX_HEIGHT));
          setLoading(false);
        });
    }

    if (debouncedSearchQuery === '') {
      setResults([]);
      setLoading(false);

      if (mounted) {
        setPrevHeight(MAX_HEIGHT);
      }
    }
  }, [debouncedSearchQuery, mounted]);

  React.useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      setPrevHeight(MAX_HEIGHT);
    }, 400);
  }, [mounted]);

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
        <SearchOverlay
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
          <SearchWrapper
            initial={{ scale: 0.8, opacity: 0, x: '-50%' }}
            animate={{ scale: 1, opacity: 1, x: '-50%' }}
            exit={{
              scale: 0.5,
              opacity: 0,
              x: '-50%',
              transition: { duration: 0.15, delay: 0.1 },
            }}
            transition={{
              ease: 'easeOut',
              duration: 0.2,
            }}
            data-testid="search"
            ref={SearchRef}
          >
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
                  opacity: 0.8;
              }
                `}
              >
                {debouncedSearchQuery !== '' && !loading
                  ? `${results.length} results`
                  : null}
              </div>
            </form>
            <AnimatePresence>
              {mounted ? (
                <>
                  {debouncedSearchQuery !== '' && results.length >= 0 ? (
                    <SearchResults
                      initial={{ height: prevHeight }}
                      animate={{
                        height: results.length * 65,
                      }}
                      exit={{ height: 0 }}
                      transition={{
                        ease: 'easeInOut',
                        duration: 0.3,
                      }}
                    >
                      {results.length > 0
                        ? results.map((result, index) => {
                            return (
                              <Result
                                data-testid="search-result"
                                key={result.slug}
                                id={result.slug}
                                selected={selectedResult === result}
                                onPointerEnter={() => handlePointer(index)}
                              >
                                <Link
                                  href={`/${
                                    result.type === 'snippet'
                                      ? 'snippets'
                                      : 'posts'
                                  }/${result.slug}`}
                                >
                                  <a onClick={onClose}>{result.title}</a>
                                </Link>

                                <div
                                  css={css`
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin-left: 16px;
                                    height: 40px;
                                    width: 40px;
                                    background-color: var(
                                      --maximeheckel-colors-emphasis
                                    );
                                    border-radius: var(--border-radius-1);

                                    path {
                                      stroke: var(--maximeheckel-colors-brand);
                                    }
                                  `}
                                >
                                  <EnterIcon />
                                </div>
                              </Result>
                            );
                          })
                        : null}
                    </SearchResults>
                  ) : null}
                  {debouncedSearchQuery === '' ? (
                    <SearchResults
                      initial={{ height: prevHeight }}
                      animate={{
                        height: 450,
                      }}
                      exit={{ height: 0 }}
                      transition={{
                        ease: 'easeInOut',
                        duration: 0.3,
                      }}
                    >
                      <Separator>Shortcuts</Separator>
                      <Item data-testid="shortcut" key="search-shortcut">
                        <span>Command Center</span>
                        <div>
                          <ShortcutKey>ctrl</ShortcutKey>
                          <ShortcutKey>k</ShortcutKey>
                        </div>
                      </Item>
                      <Item data-testid="shortcut" key="theme-shortcut">
                        <span>Switch Theme</span>
                        <div>
                          <ShortcutKey>ctrl</ShortcutKey>
                          <ShortcutKey>t</ShortcutKey>
                        </div>
                      </Item>
                      <Separator>Links</Separator>
                      <Item data-testid="link" key="twitter-social-link">
                        <a
                          href="https://twitter.com/MaximeHeckel"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: `none` }}
                        >
                          <TwitterIcon stroke="var(--maximeheckel-colors-typeface-2)" />
                          <span style={{ marginLeft: '15px' }}>Twitter</span>
                          <VisuallyHidden as="p">
                            Link redirects to my Twitter profile page
                            https://twitter.com/MaximeHeckel.
                          </VisuallyHidden>
                        </a>
                      </Item>
                      <Item data-testid="link" key="email-link">
                        <a
                          href="mailto:hello@maximeheckel.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: `none` }}
                        >
                          <ContactIcon stroke="var(--maximeheckel-colors-typeface-2)" />
                          <span style={{ marginLeft: '15px' }}>Contact</span>
                          <VisuallyHidden as="p">
                            Link opens your default mail client with my email
                            address hello@maximeheckel.com prefilled.
                          </VisuallyHidden>
                        </a>
                      </Item>
                      <Item data-testid="link" key="maximeheckelcom-link">
                        <a
                          href="https://maximeheckel.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: `none` }}
                        >
                          <PortfolioIcon stroke="var(--maximeheckel-colors-typeface-2)" />
                          <span style={{ marginLeft: '15px' }}>Work</span>
                          <VisuallyHidden as="p">
                            Link redirects to my portfolio
                            https://maximeheckel.com.
                          </VisuallyHidden>
                        </a>
                      </Item>
                      <Item data-testid="link" key="rss-link">
                        <Link
                          href="/rss.xml"
                          data-testid="rss-link"
                          aria-label="RSS Feed"
                        >
                          <a
                            title="RSS Feed"
                            style={{ textDecoration: `none` }}
                          >
                            <RSSIcon stroke="var(--maximeheckel-colors-typeface-2)" />
                            <span style={{ marginLeft: '15px' }}>RSS</span>
                            <VisuallyHidden as="p">
                              Link redirects to the rss.xml file.
                            </VisuallyHidden>
                          </a>
                        </Link>
                      </Item>
                    </SearchResults>
                  ) : null}
                </>
              ) : null}
            </AnimatePresence>
          </SearchWrapper>
        </SearchOverlay>
      </aside>
    </FocusTrap>,
    document.body
  );
};

export { Search };

const ShortcutKey = styled('span')`
  color: var(--maximeheckel-colors-brand);
  font-size: 14px;
  border-radius: var(--border-radius-1);
  padding: 8px 8px;
  background: var(--maximeheckel-colors-emphasis);
  &:not(:last-child) {
    margin-right: 16px;
  }
`;

const Result = styled('li')<{ selected: boolean }>`
  height: 65px;
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  position: relative;
  list-style: none;
  color: var(--maximeheckel-colors-typeface-1);
  padding: 10px 25px;

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

const Item = styled('li')`
  height: 65px;
  margin-bottom: 0px;
  transition: 0.25s;
  list-style: none;
  color: var(--maximeheckel-colors-typeface-1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 25px;

  a {
    color: unset;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  &:hover {
    background-color: var(--maximeheckel-colors-foreground);
    a {
      color: var(--maximeheckel-colors-brand);
    }

    svg {
      stroke: var(--maximeheckel-colors-brand);
    }
  }
`;

const Separator = styled('li')`
  height: 30px;
  width: 100%;
  font-size: 14px;
  background-color: var(--maximeheckel-colors-foreground);
  color: var(--maximeheckel-colors-typeface-1);
  display: flex;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
  margin-bottom: 0;
`;

const SearchResults = styled(motion.ul)`
  @media (max-width: 700px) {
    max-height: 385px;
  }

  max-height: ${MAX_HEIGHT}px;
  overflow: auto;
  margin: 0px;
`;

const SearchWrapper = styled(motion.div)<{}>`
  @media (max-width: 700px) {
    width: 100%;
    top: 0;
    border-radius: 0px;
  }

  position: fixed;
  overflow: hidden;
  background: var(--maximeheckel-colors-body);
  width: 600px;
  top: 20%;
  left: 50%;
  border-radius: var(--border-radius-2);
  box-shadow: var(--maximeheckel-shadow-1);

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

    ::-webkit-autofill {
      background: transparent;
      color: var(--maximeheckel-colors-typeface-0);
      font-size: 14px;
    }
  }
`;

const SearchOverlay = styled(motion.div)<{}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  outline: none;
`;
