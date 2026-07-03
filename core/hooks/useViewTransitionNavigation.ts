import { useRouter } from 'next/router';
import { useCallback } from 'react';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => void;
};

export const startViewTransition = (callback: () => void | Promise<void>) => {
  const transitionDocument = document as ViewTransitionDocument;

  if (!transitionDocument.startViewTransition) {
    void callback();
    return;
  }

  transitionDocument.startViewTransition(callback);
};

export const useViewTransitionNavigation = () => {
  const router = useRouter();

  const navigateWithViewTransition = useCallback(
    (href: string) => {
      startViewTransition(async () => {
        await router.push(href);
      });
    },
    [router]
  );

  return { navigateWithViewTransition };
};
