import { RefObject, useEffect } from 'react';

interface SlideshowKeyboardOptions {
  ref: RefObject<HTMLElement | null>;
  orientation: 'horizontal' | 'vertical';
  active: number;
  count: number;
  loop: boolean;
  onNavigate: (index: number) => void;
  onTogglePlayback?: () => void;
}

const keyboardOwnerSelector = [
  'input',
  'textarea',
  'select',
  'button',
  'a[href]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="textbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="tablist"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="combobox"]',
  '[role="tree"]',
  '[role="grid"]',
  '[role="dialog"]',
].join(',');

const nearestVisibleSlideshow = (orientation: string) => {
  const candidates = document.querySelectorAll<HTMLElement>(
    `[data-slideshow="${orientation}"][data-in-view="true"]`
  );

  let nearest: HTMLElement | null = null;
  let nearestDistance = Infinity;

  for (const candidate of Array.from(candidates)) {
    const bounds = candidate.getBoundingClientRect();

    if (
      bounds.width <= 0 ||
      bounds.height <= 0 ||
      bounds.bottom <= 0 ||
      bounds.top >= window.innerHeight ||
      bounds.right <= 0 ||
      bounds.left >= window.innerWidth
    ) {
      continue;
    }

    const distance = Math.abs(
      (bounds.top + bounds.bottom) / 2 - window.innerHeight / 2
    );

    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  return nearest;
};

export const useSlideshowKeyboard = ({
  ref,
  orientation,
  active,
  count,
  loop,
  onNavigate,
  onTogglePlayback,
}: SlideshowKeyboardOptions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        count < 2 ||
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      const gallery = ref.current;
      const focused = document.activeElement?.closest('[data-slideshow]');
      const ownsFocus = focused === gallery;
      const target = event.target instanceof Element ? event.target : null;

      if (
        !gallery ||
        (focused && !ownsFocus) ||
        (!ownsFocus && target?.closest(keyboardOwnerSelector))
      ) {
        return;
      }

      if (ownsFocus && event.key === ' ' && onTogglePlayback) {
        event.preventDefault();

        if (!event.repeat) onTogglePlayback();

        return;
      }

      const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

      let nextIndex: number;

      if (event.key === nextKey) nextIndex = active + 1;
      else if (event.key === previousKey) nextIndex = active - 1;
      else if (ownsFocus && event.key === 'Home') nextIndex = 0;
      else if (ownsFocus && event.key === 'End') nextIndex = count - 1;
      else return;

      if (!ownsFocus && nearestVisibleSlideshow(orientation) !== gallery) {
        return;
      }

      nextIndex = loop
        ? (nextIndex + count) % count
        : Math.max(0, Math.min(nextIndex, count - 1));

      if (nextIndex === active) return;

      event.preventDefault();
      onNavigate(nextIndex);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ref, orientation, active, count, loop, onNavigate, onTogglePlayback]);
};
