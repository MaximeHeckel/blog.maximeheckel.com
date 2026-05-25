import { useEffect, useRef } from 'react';
import type { NextRouter } from 'next/router';

let shouldSkipNextArticlesScramble = false;

const getPathname = (url: string) => {
  return new URL(url, window.location.origin).pathname;
};

const isHomePath = (pathname: string) => pathname === '/';

export const useSkipArticlesScrambleWhenLeavingPost = (router: NextRouter) => {
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const handleRouteChangeStart = (url: string) => {
      shouldSkipNextArticlesScramble = isHomePath(getPathname(url));
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router]);
};

export const useShouldSkipArticlesScramble = () => {
  const shouldSkipRef = useRef(shouldSkipNextArticlesScramble);
  const shouldSkip = shouldSkipRef.current;

  useEffect(() => {
    if (shouldSkip) {
      shouldSkipNextArticlesScramble = false;
    }
  }, [shouldSkip]);

  return shouldSkip;
};
