import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

import { usePressActivation } from '@core/hooks/usePressActivation';
import { useViewTransitionNavigation } from '@core/hooks/useViewTransitionNavigation';

type ViewTransitionLinkProps = ComponentProps<typeof Link> & {
  navigateOnPress?: boolean;
};

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
  const { navigateOnPress = false, ...linkProps } = props;
  const { navigateWithViewTransition } = useViewTransitionNavigation();
  const getPressActivationProps = usePressActivation<HTMLAnchorElement>();

  const canNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    const anchor = event.currentTarget;

    return (
      !event.defaultPrevented &&
      !isModifiedClick(event) &&
      !anchor.target &&
      !anchor.hasAttribute('download') &&
      new URL(anchor.href).origin === window.location.origin
    );
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(event);

    if (!canNavigate(event)) {
      return;
    }

    const url = new URL(event.currentTarget.href);

    event.preventDefault();
    navigateWithViewTransition(`${url.pathname}${url.search}${url.hash}`);
  };

  const pressActivationProps = getPressActivationProps(handleClick);

  return (
    <Link
      {...linkProps}
      onPointerDown={(event) => {
        pressActivationProps.onPointerCancel();
        props.onPointerDown?.(event);

        if (navigateOnPress && canNavigate(event)) {
          pressActivationProps.onPointerDown(event);
        }
      }}
      onPointerCancel={(event) => {
        props.onPointerCancel?.(event);
        pressActivationProps.onPointerCancel();
      }}
      onClick={navigateOnPress ? pressActivationProps.onClick : handleClick}
    />
  );
};

export default ViewTransitionLink;
