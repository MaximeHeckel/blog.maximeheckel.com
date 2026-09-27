import { useReducedMotion } from 'motion/react';
import { RefObject, useLayoutEffect, useRef } from 'react';

// Animate the window itself; the draggable anchor is only the destination.
export const useAnchorTransition = (
  state: 'open' | 'minimized' | 'closed',
  windowRef: RefObject<HTMLDivElement | null>,
  anchorRef: RefObject<HTMLButtonElement | null>
) => {
  const previous = useRef<'open' | 'minimized' | 'closed'>('closed');
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = state;
    const element = windowRef.current;
    const anchor = anchorRef.current;
    // Release the hidden backdrop-filter surface, while keeping React state.
    if (element) element.style.display = state === 'open' ? '' : 'none';
    const minimizing = from === 'open' && state === 'minimized';
    const expanding = from === 'minimized' && state === 'open';
    const entering = from === 'closed' && state === 'open';
    if (element && entering && !reducedMotion && element.animate) {
      element.style.visibility = 'visible';
      const entrance = element.animate(
        [
          { opacity: 0, transform: 'scale(0.96)', transformOrigin: 'center' },
          { opacity: 1, transform: 'scale(1)', transformOrigin: 'center' },
        ],
        { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
      return () => entrance.cancel();
    }
    if (
      !element ||
      !anchor ||
      reducedMotion ||
      (!minimizing && !expanding) ||
      !element.animate
    )
      return;

    // The shell must participate in layout to measure and animate a collapse.
    element.style.display = '';
    const windowBounds = element.getBoundingClientRect();
    const anchorBounds = anchor.getBoundingClientRect();
    if (!windowBounds.width || !windowBounds.height) {
      element.style.display = state === 'open' ? '' : 'none';
      return;
    }
    const collapsed = `translate(${anchorBounds.left - windowBounds.left}px, ${anchorBounds.top - windowBounds.top}px) scale(${anchorBounds.width / windowBounds.width}, ${anchorBounds.height / windowBounds.height})`;
    element.style.visibility = 'visible';
    // Percentage radii survive the nonuniform scale: the destination is a
    // capsule with a radius of half the anchor's height, not a tiny rectangle.
    const radius = getComputedStyle(element).borderRadius || '22px';
    const capsuleRadius = `${(anchorBounds.height / (2 * anchorBounds.width)) * 100}% / 50%`;
    const frames = [
      { transform: 'none', borderRadius: radius },
      { transform: collapsed, borderRadius: capsuleRadius },
    ];
    const duration = minimizing ? 320 : 240;
    const animation = element.animate(
      expanding ? [...frames].reverse() : frames,
      {
        duration,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    );
    // Crossfade once the fast movement has brought the shell near the anchor.
    // Finish before the final frame to avoid a visible box-to-anchor swap.
    const fade = element.animate(
      minimizing
        ? [
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.45 },
            { opacity: 0, offset: 0.9 },
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
              { opacity: 0, offset: 0.45 },
              { opacity: 1, offset: 0.9 },
              { opacity: 1, offset: 1 },
            ],
            { duration }
          )
        : null;
    animation.onfinish = () => {
      element.style.visibility = state === 'open' ? 'visible' : 'hidden';
      element.style.display = state === 'open' ? '' : 'none';
    };
    return () => {
      animation.onfinish = null;
      animation.cancel();
      fade.cancel();
      reveal?.cancel();
      element.style.visibility = 'hidden';
      element.style.display = 'none';
    };
  }, [state, reducedMotion, windowRef, anchorRef]);
};
