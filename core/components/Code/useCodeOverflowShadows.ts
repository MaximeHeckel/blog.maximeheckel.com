import { RefObject, useEffect } from 'react';

export const useCodeOverflowShadows = (
  ref: RefObject<HTMLPreElement | null>,
  codeString: string
) => {
  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    let active = false;
    let overflowing = false;
    let resizeObserver: ResizeObserver | undefined;

    const updateShadows = () => {
      const progress = overflowing
        ? Math.min(1, Math.max(0, (element.scrollLeft - 10) / 40))
        : 0;

      element.style.setProperty('--shadow-opacity-left', String(progress));
      element.style.setProperty(
        '--shadow-opacity-right',
        String(overflowing ? 1 - progress : 0)
      );
    };

    const measureOverflow = () => {
      if (!active) return;

      overflowing = element.scrollWidth > element.clientWidth;
      updateShadows();
    };

    const stop = () => {
      active = false;
      resizeObserver?.disconnect();
      element.removeEventListener('scroll', updateShadows);
      document.fonts?.removeEventListener('loadingdone', measureOverflow);
    };

    const start = () => {
      if (active) return;

      active = true;
      measureOverflow();
      element.addEventListener('scroll', updateShadows, { passive: true });
      document.fonts?.addEventListener('loadingdone', measureOverflow);

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(measureOverflow);
        resizeObserver.observe(element);
      }
    };

    // Distant blocks keep their server-rendered markup without layout reads or
    // scroll subscriptions. Prepare shadows shortly before a block enters view.
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) start();
              else stop();
            },
            { rootMargin: '200px 0px' }
          )
        : undefined;

    if (observer) observer.observe(element);
    else start();

    return () => {
      observer?.disconnect();
      stop();
    };
  }, [ref, codeString]);
};
