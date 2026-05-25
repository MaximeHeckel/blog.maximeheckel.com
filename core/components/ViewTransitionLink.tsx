import type { ComponentProps, MouseEvent } from 'react';
import Link from 'next/link';

import { useViewTransitionNavigation } from '@core/hooks/useViewTransitionNavigation';

type ViewTransitionLinkProps = ComponentProps<typeof Link>;

const isModifiedClick = (event: MouseEvent<HTMLAnchorElement>) => {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  );
};

const ViewTransitionLink = (props: ViewTransitionLinkProps) => {
  const { navigateWithViewTransition } = useViewTransitionNavigation();

  return (
    <Link
      {...props}
      onClick={(event) => {
        props.onClick?.(event);

        const anchor = event.currentTarget;
        const url = new URL(anchor.href);

        if (
          event.defaultPrevented ||
          isModifiedClick(event) ||
          anchor.target ||
          anchor.hasAttribute('download') ||
          url.origin !== window.location.origin
        ) {
          return;
        }

        event.preventDefault();

        navigateWithViewTransition(`${url.pathname}${url.search}${url.hash}`);
      }}
    />
  );
};

export default ViewTransitionLink;
