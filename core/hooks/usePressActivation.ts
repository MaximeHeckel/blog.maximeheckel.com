import { MouseEvent, MouseEventHandler, PointerEvent, useRef } from 'react';

export const usePressActivation = <T extends HTMLElement>() => {
  const activatedTarget = useRef<T | null>(null);

  return (activate: MouseEventHandler<T>) => ({
    onPointerDown: (event: PointerEvent<T>) => {
      activatedTarget.current = null;

      if (
        event.defaultPrevented ||
        event.pointerType !== 'mouse' ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      activatedTarget.current = event.currentTarget;

      // Focus before activation so opening a dialog can move focus into it.
      event.currentTarget.focus({ preventScroll: true });
      activate(event);
      event.preventDefault();
    },
    onPointerCancel: () => {
      activatedTarget.current = null;
    },
    onClick: (event: MouseEvent<T>) => {
      const alreadyActivated =
        event.detail !== 0 && activatedTarget.current === event.currentTarget;

      activatedTarget.current = null;

      if (alreadyActivated) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      activate(event);
    },
  });
};
