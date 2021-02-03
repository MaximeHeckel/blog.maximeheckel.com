import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import FocusTrap from 'focus-trap-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { useTheme } from '../../context/ThemeContext';
import VisuallyHidden from '../VisuallyHidden';

const TwitterIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="var(--maximeheckel-colors-typeface-2)"
  >
    <path
      d="M23.8618 2.9995C22.9042 3.67497 21.8439 4.19161 20.7218 4.5295C20.1196 3.83701 19.3192 3.34619 18.4289 3.12342C17.5386 2.90066 16.6013 2.95669 15.7439 3.28395C14.8865 3.61121 14.1503 4.1939 13.6348 4.95321C13.1193 5.71253 12.8495 6.61183 12.8618 7.5295V8.5295C11.1044 8.57506 9.36309 8.18531 7.79283 7.39494C6.22256 6.60458 4.87213 5.43813 3.86182 3.9995C3.86182 3.9995 -0.138184 12.9995 8.86182 16.9995C6.80234 18.3975 4.34897 19.0984 1.86182 18.9995C10.8618 23.9995 21.7818 18.8949 21.7818 7.39494C21.7809 7.1164 21.8341 6.94309 21.7818 6.6695C22.8024 5.66299 23.5226 4.39221 23.8618 2.9995Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Portfolio = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 25 24"
    xmlns="http://www.w3.org/2000/svg"
    stroke="var(--maximeheckel-colors-typeface-2)"
    fill="none"
  >
    <path
      d="M22.4355 18.9995C22.4355 19.5299 22.2248 20.0387 21.8498 20.4137C21.4747 20.7888 20.966 20.9995 20.4355 20.9995H4.43555C3.90511 20.9995 3.39641 20.7888 3.02133 20.4137C2.64626 20.0387 2.43555 19.5299 2.43555 18.9995V4.99951C2.43555 4.46908 2.64626 3.96037 3.02133 3.5853C3.39641 3.21023 3.90511 2.99951 4.43555 2.99951H9.43555L11.4355 5.99951H20.4355C20.966 5.99951 21.4747 6.21023 21.8498 6.5853C22.2248 6.96037 22.4355 7.46908 22.4355 7.99951V18.9995Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Contact = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 25 25"
    xmlns="http://www.w3.org/2000/svg"
    stroke="var(--maximeheckel-colors-typeface-2)"
    fill="none"
  >
    <path
      d="M22.4355 2.73096L11.4355 13.731"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.4355 2.73096L15.4355 22.731L11.4355 13.731L2.43555 9.73096L22.4355 2.73096Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RSS = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 25 24"
    stroke="var(--maximeheckel-colors-typeface-2)"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.36719 11C6.75414 11 9.04332 11.9482 10.7311 13.636C12.419 15.3239 13.3672 17.6131 13.3672 20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.36719 4C8.61065 4 12.6803 5.68571 15.6809 8.68629C18.6815 11.6869 20.3672 15.7565 20.3672 20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.36719 20C5.91947 20 6.36719 19.5523 6.36719 19C6.36719 18.4477 5.91947 18 5.36719 18C4.8149 18 4.36719 18.4477 4.36719 19C4.36719 19.5523 4.8149 20 5.36719 20Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type Result = {
  type: 'snippet' | 'blogPost';
  slug: string;
  title: string;
};

interface Props {
  onClose?: () => void;
  showOverride?: boolean;
}

const toggleLockScroll = () =>
  document.documentElement.classList.toggle('lock-scroll');

const SearchBox: React.FC<Props> = (props) => {
  const { onClose, showOverride } = props;

  const router = useRouter();

  // Local state to track the input value
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchBoxRef = React.useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(showOverride);
  const [results, setResults] = React.useState<Result[]>([]);

  const close = React.useCallback(() => {
    toggleLockScroll();
    onClose && onClose();
    return setShow(false);
    // eslint-disable-next-line
  }, []);

  const clickAway = (e: React.BaseSyntheticEvent) => {
    if (
      searchBoxRef &&
      searchBoxRef.current &&
      searchBoxRef.current.contains(e.target)
    ) {
      return null;
    }
    return close();
  };

  const onEnterKey = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.keyCode === 13) {
      close();
    }
  };

  const onLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    event.preventDefault();
    close();
    router.push(href);
  };

  React.useEffect(() => {
    Mousetrap.bind(['ctrl+k'], () => setShow((prevState) => !prevState));
    return () => {
      Mousetrap.unbind(['ctrl+k']);
    };
  }, []);

  React.useEffect(() => {
    setShow(showOverride);
  }, [showOverride]);

  React.useEffect(() => {
    if (show) {
      toggleLockScroll();
      inputRef && inputRef.current && inputRef.current.focus();
    }
  }, [show]);

  React.useEffect(() => {
    const keyPressHandler = (e: KeyboardEvent): void => {
      if (show) {
        switch (e.keyCode) {
          case 27:
            return close();
          default:
            return;
        }
      }
    };

    document.addEventListener('keydown', keyPressHandler);

    return () => {
      document.removeEventListener('keydown', keyPressHandler);
    };
    // eslint-disable-next-line
  }, [show]);

  React.useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery !== '') {
      const searchEndpoint = `/api/search?q=${debouncedSearchQuery.toLowerCase()}`;
      fetch(searchEndpoint)
        .then((res) => res.json())
        .then((res) => setResults(res.results));
    }

    if (debouncedSearchQuery === '') {
      setResults([]);
    }
  }, [debouncedSearchQuery]);

  const { dark } = useTheme();

  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <FocusTrap>
      <aside>
        <SearchBoxOverlay
          initial={{
            backgroundColor: dark ? 'rgba(0,0,0,0)' : 'rgba(241, 243, 247, 0)',
          }}
          animate={{
            backgroundColor: dark
              ? 'rgba(0,0,0,0.8)'
              : 'rgba(241, 243, 247, 0.8)',
          }}
          transition={{ duration: 0.8, when: 'beforeChildren' }}
          onClick={clickAway}
          data-testid="searchbox-overlay"
          aria-label="search"
          // The dialog container element has aria-modal set to true.
          aria-modal="true"
          tabIndex={-1}
          // All elements required to operate the dialog are descendants of the element that has role dialog.
          role="dialog"
        >
          <SearchBoxWrapper
            initial={{ scale: 0, x: '-50%' }}
            animate={{ scale: 1, x: '-50%' }}
            transition={{
              ease: 'easeOut',
            }}
            data-testid="searchbox"
            ref={searchBoxRef}
          >
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
            </form>
            <SearchResults
              results={results.length}
              searchQuery={debouncedSearchQuery}
              css={css`
                border-top: ${debouncedSearchQuery
                  ? `1px solid ${
                      dark
                        ? 'hsla(var(--palette-gray-100), 100%)'
                        : 'hsla(var(--palette-gray-10), 100%)'
                    }`
                  : 'none'};
              `}
            >
              {debouncedSearchQuery !== '' && results.length > 0 ? (
                results.map((result) => {
                  return (
                    <Item data-testid="search-result" key={result.slug}>
                      <a
                        href={`/${
                          result.type === 'snippet' ? 'snippets' : 'posts'
                        }/${result.slug}`}
                        onClick={(event) =>
                          onLinkClick(
                            event,
                            `/${
                              result.type === 'snippet' ? 'snippets' : 'posts'
                            }/${result.slug}/`
                          )
                        }
                        style={{ textDecoration: `none` }}
                        onKeyPress={onEnterKey}
                      >
                        {result.title}
                      </a>
                    </Item>
                  );
                })
              ) : debouncedSearchQuery === '' ? (
                <>
                  <Separator>Shortcuts</Separator>
                  <Item data-testid="shortcut" key="search-shortcut">
                    <div>
                      <span>Command Center</span>
                      <div>
                        <ShortcutKey>ctrl</ShortcutKey>
                        <ShortcutKey>k</ShortcutKey>
                      </div>
                    </div>
                  </Item>
                  <Item data-testid="shortcut" key="theme-shortcut">
                    <div>
                      <span>Switch Theme</span>
                      <div>
                        <ShortcutKey>ctrl</ShortcutKey>
                        <ShortcutKey>t</ShortcutKey>
                      </div>
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
                      <TwitterIcon />
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
                      <Contact />
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
                      <Portfolio />
                      <span style={{ marginLeft: '15px' }}>Work</span>
                      <VisuallyHidden as="p">
                        Link redirects to my portfolio https://maximeheckel.com.
                      </VisuallyHidden>
                    </a>
                  </Item>
                  <Item data-testid="link" key="rss-link">
                    <Link
                      href="/rss.xml"
                      data-testid="rss-link"
                      aria-label="RSS Feed"
                    >
                      <a title="RSS Feed" style={{ textDecoration: `none` }}>
                        <RSS />
                        <span style={{ marginLeft: '15px' }}>RSS</span>
                        <VisuallyHidden as="p">
                          Link redirects to the rss.xml file.
                        </VisuallyHidden>
                      </a>
                    </Link>
                  </Item>
                </>
              ) : (
                <NoResultsWrapper>No results</NoResultsWrapper>
              )}
            </SearchResults>
          </SearchBoxWrapper>
        </SearchBoxOverlay>
      </aside>
    </FocusTrap>,
    document.body
  );
};

export default SearchBox;

const NoResultsWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 65px;
  color: var(--maximeheckel-colors-typeface-1);
  font-weight: 500;
`;

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

const Item = styled('li')`
  height: 65px;
  margin-bottom: 0px;
  transition: 0.25s;
  list-style: none;
  color: var(--maximeheckel-colors-typeface-1);

  > *:not(svg) {
    height: inherit;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 25px;
    font-size: 16px;
    width: 100%;
  }

  a {
    color: unset;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  div {
    justify-content: space-between;
  }

  &:hover {
    a {
      background-color: var(--maximeheckel-colors-foreground);
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

const SearchResults = styled('ul')<{
  results: number;
  searchQuery: string;
  css: SerializedStyles;
}>`
  @media (max-width: 700px) {
    max-height: 385px;
  }

  max-height: 500px;
  overflow: auto;
  margin: 0px;
  transition: height 0.6s ease;
  will-change: height;

  height: ${(p) =>
    p.results > 0 ? p.results * 65 : p.searchQuery ? 65 : 450}px;
}
  
`;

const SearchBoxWrapper = styled(motion.div)<{}>`
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

const SearchBoxOverlay = styled(motion.div)<{}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  outline: none;
`;
