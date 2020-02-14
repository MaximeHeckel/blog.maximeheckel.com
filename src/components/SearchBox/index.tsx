import styled from '@emotion/styled';
import FocusTrap from 'focus-trap-react';
import { Link, navigate } from 'gatsby';
import Logo from 'gatsby-theme-maximeheckel/src/components/Logo';
import { useTheme } from 'gatsby-theme-maximeheckel/src/context/ThemeContext';
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

const SearchBox = props => {
  const { location } = props;
  const searchQuery = new URLSearchParams(location.search).get('search') || '';
  const toggleLockScroll = () =>
    document.documentElement.classList.toggle('lock-scroll');

  const theme = useTheme();
  const inputRef = React.useRef(null);
  const searchBoxRef = React.useRef();
  const [show, setShow] = React.useState(false);
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    Mousetrap.bind(['command+k', 'ctrl+k'], () => setShow(true));
    return () => {
      Mousetrap.unbind(['command+k', 'ctrl+k']);
    };
  }, []);

  React.useEffect(() => {
    if (show) {
      toggleLockScroll();
      inputRef.current.focus();
    }
  }, [show]);

  React.useEffect(() => {
    if (searchQuery && searchQuery !== '' && window.__LUNR__) {
      window.__LUNR__.__loaded.then(lunr => {
        const refs = lunr.en.index.search(searchQuery);
        const posts = refs.map(({ ref }) => lunr.en.store[ref]);
        setResults(posts);
      });
    }

    if (searchQuery === '') {
      setResults([]);
    }
  }, [location.search, show, searchQuery]);

  const onClose = () => {
    toggleLockScroll();
    return setShow(false);
  };

  const clickAway = e => {
    if (searchBoxRef.current.contains(e.target)) {
      return null;
    }
    return onClose();
  };

  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <FocusTrap>
      <SearchBoxOverlay
        onClick={clickAway}
        aria-label="search"
        // The dialog container element has aria-modal set to true.
        aria-modal="true"
        tabIndex="-1"
        // All elements required to operate the dialog are descendants of the element that has role dialog.
        role="dialog"
      >
        <SearchBoxWrapper ref={searchBoxRef}>
          <form>
            <input
              ref={inputRef}
              autofill="off"
              autoComplete="off"
              type="search"
              placeholder="Search..."
              id="search-input"
              name="search"
              onKeyDown={e => e.keyCode === 27 && onClose()}
              onChange={e =>
                navigate(`?search=${encodeURIComponent(e.target.value)}`)
              }
              value={searchQuery}
            />
          </form>
          <SearchResults>
            {results.map(result => {
              return (
                <Item key={result.slug} dark={theme.dark}>
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
            })}
            <Item dark={theme.dark}>
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
            <Item dark={theme.dark}>
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

const Item = styled('li')`
  height: 75px;
  margin-bottom: 0px;
  padding-left: 24px;
  padding-right: 24px;
  transition: ${props => props.theme.transitionTime / 1.7}s;

  &:hover {
    background: ${p =>
      p.dark ? 'rgba(17, 18, 22, 0.5)' : 'rgba(17,18,22, 0.04)'};

    p {
      color: unset;
    }
  }

  a {
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
  max-height: 400px;
  overflow: scroll;
  margin: 0px;
`;

const SearchBoxWrapper = styled('div')`
  position: fixed;
  background: ${p => p.theme.backgroundColor};
  width: 600px;
  top: 18%;
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
