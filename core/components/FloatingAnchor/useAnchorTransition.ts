import { useReducedMotion } from 'motion/react';
import { RefObject, useLayoutEffect, useRef } from 'react';

// Animate the window itself; the draggable anchor is only the destination.
export const useAnchorTransition = (
  state: 'open' | 'minimized' | 'closed',
  windowRef: RefObject<HTMLDivElement | null>,
  anchorRef: RefObject<HTMLButtonElement | null>
) => {
  const previous = useRef(state);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = state;
    const element = windowRef.current;
    const anchor = anchorRef.current;
    const minimizing = from === 'open' && state === 'minimized';
    const expanding = from === 'minimized' && state === 'open';
    if (
      !element ||
      !anchor ||
      reducedMotion ||
      (!minimizing && !expanding) ||
      !element.animate
    )
      return;

    const windowBounds = element.getBoundingClientRect();
    const anchorBounds = anchor.getBoundingClientRect();
    if (!windowBounds.width || !windowBounds.height) return;
    const collapsed = `translate(${anchorBounds.left - windowBounds.left}px, ${anchorBounds.top - windowBounds.top}px) scale(${anchorBounds.width / windowBounds.width}, ${anchorBounds.height / windowBounds.height})`;
    element.style.visibility = 'visible';
    const frames = [{ transform: 'none' }, { transform: collapsed }];
    const duration = minimizing ? 320 : 240;
    const animation = element.animate(
      expanding ? [...frames].reverse() : frames,
      {
        duration,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    );
    // Keep a single visible surface until the window is almost at the anchor.
    // Opacity has its own linear clock, independent of the movement easing.
    const fade = element.animate(
      minimizing
        ? [
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.75 },
            { opacity: 0, offset: 1 },
          ]
        : [
            { opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.25 },
            { opacity: 1, offset: 1 },
          ],
      { duration }
    );
    const reveal =
      minimizing && anchor.animate
        ? anchor.animate(
            [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.75 },
              { opacity: 1, offset: 1 },
            ],
            { duration }
          )
        : null;
    animation.onfinish = () => {
      element.style.visibility = state === 'open' ? 'visible' : 'hidden';
    };
    return () => {
      animation.onfinish = null;
      animation.cancel();
      fade.cancel();
      reveal?.cancel();
      element.style.visibility = 'hidden';
    };
  }, [state, reducedMotion, windowRef, anchorRef]);
};
