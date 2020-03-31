import FocusTrap from 'focus-trap-react';
import { Link, navigate } from 'gatsby';
import Logo from 'gatsby-theme-maximeheckel/src/components/Logo';
import { useTheme } from 'gatsby-theme-maximeheckel/src/context/ThemeContext';
import styled from 'gatsby-theme-maximeheckel/src/utils/styled';
import Mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);
declare global {
  interface Window {
    __LUNR__: any;
  }
}

type Result = {
  date: string;
  slug: string;
  title: string;
};

interface IProps {
  location: { search?: string };
  onClose: () => void;
  showOverride?: boolean;
}

const SearchBox: React.FC<IProps> = props => {
  const { location, onClose, showOverride } = props;
  const searchQuery = new URLSearchParams(location.search).get('search') || '';
  const toggleLockScroll = () =>
    document.documentElement.classList.toggle('lock-scroll');

  const theme = useTheme();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchBoxRef = React.useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(showOverride);
  const [results, setResults] = React.useState<Result[]>([]);

  const close = React.useCallback(() => {
    toggleLockScroll();
    navigate('');
    onClose();
    return setShow(false);
  }, [onClose]);

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

  React.useEffect(() => {
    Mousetrap.bind(['command+k', 'ctrl+k'], () => setShow(true));
    return () => {
      Mousetrap.unbind(['command+k', 'ctrl+k']);
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
      switch (e.keyCode) {
        case 27:
          return close();
        default:
          return;
      }
    };

    document.addEventListener('keydown', keyPressHandler);

    return () => {
      document.removeEventListener('keydown', keyPressHandler);
    };
  }, [close]);

  React.useEffect(() => {
    if (searchQuery && searchQuery !== '' && window.__LUNR__) {
      window.__LUNR__.__loaded.then(
        (lunr: {
          en: {
            index: { search: (arg0: string) => { ref: string }[] };
            store: { [x: string]: any };
          };
        }) => {
          const refs: { ref: string }[] = lunr.en.index.search(searchQuery);
          const posts = refs.map(({ ref }) => lunr.en.store[ref]);
          setResults(posts);
        }
      );
    }

    if (searchQuery === '') {
      setResults([]);
    }
  }, [location.search, show, searchQuery]);

  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <FocusTrap>
      <SearchBoxOverlay
        onClick={clickAway}
        data-testid="searchbox-overlay"
        aria-label="search"
        // The dialog container element has aria-modal set to true.
        aria-modal="true"
        tabIndex={-1}
        // All elements required to operate the dialog are descendants of the element that has role dialog.
        role="dialog"
      >
        <SearchBoxWrapper data-testid="searchbox" ref={searchBoxRef}>
          <form onSubmit={e => e.preventDefault()}>
            <input
              ref={inputRef}
              autoComplete="off"
              type="search"
              placeholder="Type keywords to search..."
              data-testid="search-input"
              id="search-input"
              name="search"
              onChange={e =>
                navigate(`?search=${encodeURIComponent(e.target.value)}`)
              }
              value={searchQuery}
            />
          </form>
          <SearchResults>
            {searchQuery === '' || results.length > 0 ? (
              results.map(result => {
                return (
                  <Item
                    data-testid="search-result"
                    key={result.slug}
                    dark={theme.dark}
                  >
                    <Link
                      style={{ textDecoration: `none` }}
                      onClick={() => toggleLockScroll()}
                      to={result.slug}
                    >
                      <h4>{result.title}</h4>
                      <p>{new Date(Date.parse(result.date)).toDateString()}</p>
                    </Link>
                  </Item>
                );
              })
            ) : (
              <NoResultsWrapper>No results</NoResultsWrapper>
            )}
            <Item data-testid="portfolio-link" dark={theme.dark}>
              <a
                href="https://maximeheckel.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: `none` }}
              >
                <div>
                  <Logo alt="Maxime Heckel's logo" size={30} />
                  <b>Go to portfolio</b>
                </div>
              </a>
            </Item>
            <Item data-testid="twitter-link" dark={theme.dark}>
              <a
                href="https://twitter.com/maximeheckel"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: `none` }}
              >
                <div>
                  <TwitterIcon /> <b>Follow me on Twitter</b>
                </div>
              </a>
            </Item>
          </SearchResults>
        </SearchBoxWrapper>
      </SearchBoxOverlay>
    </FocusTrap>,
    document.body
  );
};

export default SearchBox;

const NoResultsWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  color: ${p => p.theme.fontColor};
  font-weight: 600;
`;

const Item = styled('li')<{ dark: boolean }>`
  @media (max-width: 700px) {
    height: 90px;
  }

  height: 75px;
  margin-bottom: 0px;
  padding-left: 24px;
  padding-right: 24px;
  transition: ${props => props.theme.transitionTime / 1.7}s;
  list-style: none;

  &:hover {
    background: ${p =>
      p.dark ? 'rgba(17, 18, 22, 0.5)' : 'rgba(17,18,22, 0.04)'};

    p {
      color: unset;
    }
  }

  a {
    color: ${props => props.theme.fontColor};
    height: inherit;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
  }

  h4 {
    margin-bottom: 0px;
    font-weight: 500;
  }

  p {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 0px;
    color: #73737d;
  }

  div {
    display: flex;
    align-items: center;

    b {
      margin-left: 20px;
    }

    svg {
      fill: ${p => p.theme.colors.blue};
    }
  }
`;

const SearchResults = styled('ul')`
  @media (max-width: 700px) {
    max-height: 300px;
  }

  max-height: 500px;
  overflow: scroll;
  margin: 0px;
`;

const SearchBoxWrapper = styled('div')`
  @media (max-width: 700px) {
    width: 100%;
    top: 0;
  }

  position: fixed;
  background: ${p => p.theme.backgroundColor};
  width: 600px;
  top: 15%;
  left: 50%;
  transform: translate(-50%, 0%);
  border-radius: 5px;
  border: 1px solid ${p => p.theme.borderColor};
  box-shadow: ${p => p.theme.boxShadow};

  form {
    margin-bottom: 30px;
    padding: 24px 24px 0px;
  }

  input {
    outline: none;
    background: transparent;
    border: none;
    font-size: 32px;
    font-weight: 300;
    height: 55px;
    width: 100%;
    color: ${p => p.theme.fontColor};
    ::placeholder,
    ::-webkit-input-placeholder {
      color: #73737d;
    }
    :-ms-input-placeholder {
      color: #73737d;
    }

    ::-webkit-autofill {
      background: transparent;
      color: ${p => p.theme.fontColor};
      font-size: 14px;
    }
  }
`;

const SearchBoxOverlay = styled('aside')`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 50;
  background: ${p => p.theme.overlayBackground};
`;
