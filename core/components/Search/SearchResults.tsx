import { Flex, Icon } from '@maximeheckel/design-system';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { HEIGHT, MAX_HEIGHT } from './constants';
import * as S from './Search.styles';
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

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          const href = selectedResult.url.replace(
            'https://blog.maximeheckel.com',
            ''
          );
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

  useEffect(() => {
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleKey]);

  useEffect(() => {
    if (selectedResult) {
      document
        .getElementById(selectedResult.url)
        ?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedResult]);

  return (
    <S.ResultListWrapper>
      <S.ResultList
        style={{
          height:
            results.length === 0
              ? HEIGHT
              : results.length * HEIGHT + 2 >= MAX_HEIGHT
              ? MAX_HEIGHT
              : results.length * HEIGHT + 2,
          transition: 'height 0.4s ease-out',
          willChange: 'height',
        }}
      >
        {results.map((result, index) => (
          <S.Result
            data-testid="search-result"
            key={result.url}
            id={result.url}
            selected={selectedResult === result}
            onPointerEnter={() => handlePointer(index)}
          >
            <Link
              href={result.url.replace('https://blog.maximeheckel.com', '')}
              onClick={() => setTimeout(onClose, 600)}
            >
              {result.title}
            </Link>
            <Flex
              alignItems="center"
              justifyContent="center"
              css={{
                height: '35px',
                width: '35px',
                backgroundColor: 'var(--emphasis)',
                borderRadius: 'var(--border-radius-1)',

                path: {
                  stroke: 'var(--accent)',
                },
              }}
            >
              <Icon.Enter size={4} />
            </Flex>
          </S.Result>
        ))}
      </S.ResultList>
    </S.ResultListWrapper>
  );
};

export default StaticSearchResults;
