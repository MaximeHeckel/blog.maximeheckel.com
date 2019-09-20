import styled from '@emotion/styled';
import FocusTrap from 'focus-trap-react';
import { graphql, Link, navigate } from 'gatsby';
import { Button, MainWrapper, Seo } from 'gatsby-theme-maximeheckel';
import Mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';
import Typist from 'react-typist';
import TypistLoop from '../components/TypistLoop';

export const pageQuery = graphql`
  query IndexPageQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          id
          timeToRead
          frontmatter {
            slug
            title
            description
            date
            featured
            cover {
              childImageSharp {
                fluid(
                  maxWidth: 800
                  maxHeight: 280
                  quality: 80
                  cropFocus: ENTROPY
                ) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SearchBox = props => {
  const { location } = props;
  const searchQuery = new URLSearchParams(location.search).get('search') || '';
  const toggleLockScroll = () => document.body.classList.toggle('lock-scroll');

  const inputRef = React.useRef(null);
  const searchBoxRef = React.useRef();
  const [show, setShow] = React.useState(false);
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    toggleLockScroll();
    Mousetrap.bind(['command+k', 'ctrl+k'], () => setShow(true));
    return () => {
      toggleLockScroll();
      Mousetrap.unbind(['command+k', 'ctrl+k']);
    };
  }, []);

  React.useEffect(() => {
    if (show) {
      inputRef.current.focus();
    }

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
  }, [location.search, show]);

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
          <input
            ref={inputRef}
            autofill="off"
            autoComplete="off"
            type="search"
            placeholder="Search..."
            id="search-input"
            name="search"
            onKeyDown={e => (e.keyCode === 27 ? onClose() : null)}
            onChange={e =>
              navigate(`?search=${encodeURIComponent(e.target.value)}`)
            }
            value={searchQuery}
          />
          {results && results.length > 0 ? (
            <SearchResults>
              {results.map(result => {
                return (
                  <Result key={result.slug}>
                    <Link style={{ textDecoration: `none` }} to={result.slug}>
                      <h4>{result.title}</h4>
                      <p>{new Date(Date.parse(result.date)).toDateString()}</p>
                    </Link>
                    <hr />
                  </Result>
                );
              })}
            </SearchResults>
          ) : null}
        </SearchBoxWrapper>
      </SearchBoxOverlay>
    </FocusTrap>,
    document.body
  );
};

const Result = styled('li')`
  height: 60px;
  margin-bottom: 0px;
  padding-left: 12px;
  padding-right: 12px;
  transition: ${props => props.theme.transitionTime / 1.7}s;

  &:hover {
    background: ${p => p.theme.colors.blue};

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
    font-weight: 400;
  }

  p {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 0px;
    color: #73737d;
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

  input {
    background: transparent;
    border: none;
    border-bottom: 1px solid ${p => p.theme.borderColor};
    height: 55px;
    width: 100%;
    color: ${p => p.theme.fontColor};
    padding: 12px;
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

const IndexPage = ({ data, location }) => {
  return (
    <MainWrapper footer={true} header={true}>
      <Seo title={data.site.siteMetadata.title} />
      <SearchBox location={location} />
      <div style={{ paddingBottom: '10px' }}>
        <br />
        <h1>{data.site.siteMetadata.title}</h1>
        <TypistDiv>
          <h2>I write about </h2>
          <h2>
            <TypistLoop interval={2000}>
              {[
                'React',
                'Redux',
                'GraphQL',
                'testing',
                'Docker',
                'frontend development',
                'styled components',
                'a lot of other things',
              ].map(text => (
                <Typist
                  cursor={{ blink: true, element: '_' }}
                  key={text}
                  startDelay={2000}
                >
                  <span>{text}</span>
                </Typist>
              ))}
            </TypistLoop>
          </h2>
        </TypistDiv>
        <hr />
        <List>
          {data.allMdx.edges.map(({ node }) => {
            return (
              <li key={node.frontmatter.slug}>
                <Link
                  style={{ textDecoration: `none` }}
                  to={`/posts/${node.frontmatter.slug}`}
                >
                  <h3>{node.frontmatter.title}</h3>
                </Link>
                <DescriptionBlock>
                  {node.frontmatter.description}
                </DescriptionBlock>
                <ItemFooterBlock>
                  <p>
                    {new Date(Date.parse(node.frontmatter.date)).toDateString()}
                  </p>
                  <p>{node.timeToRead} min read</p>
                  <Link
                    style={{ textDecoration: `none` }}
                    to={`/posts/${node.frontmatter.slug}`}
                  >
                    <Button secondary={true}>Read</Button>
                  </Link>
                </ItemFooterBlock>
              </li>
            );
          })}
        </List>
      </div>
    </MainWrapper>
  );
};

const TypistDiv = styled('div')`
  display: flex;
  h2 {
    margin-right: 8px;
  }
`;

const List = styled('ul')`
  margin-left: 0px;

  li {
    list-style: none;
    margin-bottom: 30px;
  }

  h3 {
    margin-bottom: 10px;
  }
`;

const DescriptionBlock = styled('p')`
  color: #73737d;
  margin-bottom: 8px;
  max-width: 350px;
`;

const ItemFooterBlock = styled('div')`
  display: flex;
  align-items: center;

  p {
    font-size: 14px;
    font-weight: 600;
    margin-right: 8px;
    margin-bottom: 0px;
  }
`;

export default IndexPage;
