import { renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { useAnchorTransition } from '../useAnchorTransition';

it('keeps the window visible until it collapses into the stationary anchor', () => {
  const windowElement = document.createElement('div');
  const anchor = document.createElement('button');
  windowElement.getBoundingClientRect = () =>
    ({ left: 500, top: 40, width: 440, height: 640 }) as DOMRect;
  anchor.getBoundingClientRect = () =>
    ({ left: 900, top: 680, width: 56, height: 40 }) as DOMRect;
  const animation = { onfinish: null as (() => void) | null, cancel: vi.fn() };
  windowElement.animate = vi.fn(() => animation as unknown as Animation);
  anchor.animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
  const windowRef = { current: windowElement };
  const anchorRef = { current: anchor };
  const { rerender } = renderHook(
    ({ state }: { state: 'open' | 'minimized' | 'closed' }) =>
      useAnchorTransition(state, windowRef, anchorRef),
    { initialProps: { state: 'open' } }
  );
  expect(windowElement.animate).toHaveBeenCalledWith(
    [
      { opacity: 0, transform: 'scale(0.96)', transformOrigin: 'center' },
      { opacity: 1, transform: 'scale(1)', transformOrigin: 'center' },
    ],
    expect.objectContaining({ duration: 220 })
  );
  expect(anchor.animate).not.toHaveBeenCalled();
  rerender({ state: 'minimized' });
  expect(windowElement.style.visibility).toBe('visible');
  expect(windowElement.style.display).toBe('');
  expect(windowElement.animate).toHaveBeenCalledWith(
    [
      { transform: 'none', borderRadius: '22px' },
      {
        transform: 'translate(400px, 640px) scale(0.12727272727272726, 0.0625)',
        borderRadius: '35.714285714285715% / 50%',
      },
    ],
    expect.objectContaining({ duration: 320 })
  );
  expect(anchor.animate).toHaveBeenCalledWith(
    [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.45 },
      { opacity: 1, offset: 0.9 },
      { opacity: 1, offset: 1 },
    ],
    { duration: 320 }
  );
  animation.onfinish?.();
  expect(windowElement.style.visibility).toBe('hidden');
  expect(windowElement.style.display).toBe('none');
  rerender({ state: 'open' });
  expect(windowElement.animate).toHaveBeenCalledWith(
    [
      {
        transform: 'translate(400px, 640px) scale(0.12727272727272726, 0.0625)',
        borderRadius: '35.714285714285715% / 50%',
      },
      { transform: 'none', borderRadius: '22px' },
    ],
    expect.objectContaining({ duration: 240 })
  );
  expect(windowElement.style.visibility).toBe('visible');
  expect(windowElement.style.display).toBe('');
  rerender({ state: 'closed' });
  expect(animation.cancel).toHaveBeenCalled();
  expect(windowElement.style.visibility).toBe('hidden');
  expect(windowElement.style.display).toBe('none');
});
