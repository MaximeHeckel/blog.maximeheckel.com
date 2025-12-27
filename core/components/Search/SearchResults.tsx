import { Flex, Icon } from '@maximeheckel/design-system';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react';

import * as S from './Search.styles';
import { HEIGHT, MAX_HEIGHT } from './constants';
import { Result as ResultType } from './types';
import useIndexItem from './useIndexItem';

export interface SearchResultsNavigationRef {
  previous: () => void;
  next: () => void;
  select: () => void;
}

interface StaticSearchResultsProps {
  results: ResultType[];
  onClose: () => void;
  'aria-busy'?: boolean;
}

const StaticSearchResults = forwardRef<
  SearchResultsNavigationRef,
  StaticSearchResultsProps
>((props, ref) => {
  const { results, onClose, 'aria-busy': ariaBusy } = props;

  const router = useRouter();

  const [selectedResult, previousResult, nextResult, setSelectedResult] =
    useIndexItem(results);

  const handlePointer = (index: number) => setSelectedResult(index);

  const selectItem = useCallback(() => {
    if (selectedResult?.url) {
      const href = selectedResult.url.replace(
        'https://blog.maximeheckel.com',
        ''
      );
      router.push(href).then(() => window.scrollTo(0, 0));
      setTimeout(onClose, 600);
    }
  }, [selectedResult, router, onClose]);

  // Expose navigation methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      previous: previousResult,
      next: nextResult,
      select: selectItem,
    }),
    [previousResult, nextResult, selectItem]
  );

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
        role="listbox"
        aria-label="Search results"
        aria-busy={ariaBusy}
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
            role="option"
            aria-selected={selectedResult === result}
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
              aria-hidden="true"
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
});

StaticSearchResults.displayName = 'StaticSearchResults';

export default StaticSearchResults;
