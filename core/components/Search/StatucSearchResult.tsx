import { Flex, Icon } from '@maximeheckel/design-system';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { HEIGHT, MAX_HEIGHT } from './constants';
import { SearchResultWrapper, SearchResults, Result } from './Styles';
import useIndexItem from './useIndexItem';
import { Result as ResultType } from './types';

interface StaticSearchResultsProps {
  results: ResultType[];
  onClose: () => void;
}

const StaticSearchResults = (props: StaticSearchResultsProps) => {
  const { results, onClose } = props;

  const router = useRouter();

  const [
    selectedResult,
    previousResult,
    nextResult,
    setSelectedResult,
  ] = useIndexItem(results);

  const handlePointer = (index: number) => setSelectedResult(index);

  const handleKey = React.useCallback(
    (event: KeyboardEvent) => {
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
    },
    [selectedResult, router, onClose, previousResult, nextResult]
  );

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

  return (
    <SearchResultWrapper>
      <SearchResults
        style={{
          height:
            results.length === 0
              ? 48
              : results.length * HEIGHT >= MAX_HEIGHT
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
              href={`/${result.type === 'snippet' ? 'snippets' : 'posts'}/${
                result.slug
              }`}
              onClick={() => setTimeout(onClose, 600)}
            >
              {result.title}
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
    </SearchResultWrapper>
  );
};

export default StaticSearchResults;
