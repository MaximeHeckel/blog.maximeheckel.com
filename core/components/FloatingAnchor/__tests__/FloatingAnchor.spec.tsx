import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { FloatingAnchor } from '..';

afterEach(() => vi.unstubAllGlobals());

it('keeps the default anchor docked at its relative height through resize', async () => {
  vi.stubGlobal('innerWidth', 1000);
  vi.stubGlobal('innerHeight', 800);
  render(
    <FloatingAnchor
      active
      label="Resume Ask"
      buttonRef={null}
      onOpen={vi.fn()}
      onCornerChange={vi.fn()}
    />
  );
  const button = screen.getByRole('button', { name: 'Resume Ask' });
  vi.stubGlobal('innerWidth', 524);
  vi.stubGlobal('innerHeight', 420);
  fireEvent(window, new Event('resize'));
  await waitFor(() =>
    expect(button.style.transform).toBe('translateX(476px) translateY(332px)')
  );
  vi.stubGlobal('innerWidth', 1000);
  vi.stubGlobal('innerHeight', 800);
  fireEvent(window, new Event('resize'));
  await waitFor(() =>
    expect(button.style.transform).toBe('translateX(952px) translateY(664px)')
  );
});

it('drags without opening, then opens on a separate click', () => {
  class TestPointerEvent extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
    }
  }
  vi.stubGlobal('PointerEvent', TestPointerEvent);
  const onOpen = vi.fn();
  const onCornerChange = vi.fn();
  render(
    <FloatingAnchor
      active
      label="Resume Ask"
      buttonRef={null}
      onOpen={onOpen}
      onCornerChange={onCornerChange}
    />
  );
  const button = screen.getByRole('button', { name: 'Resume Ask' });
  button.setPointerCapture = vi.fn();
  button.releasePointerCapture = vi.fn();
  fireEvent.pointerDown(button, {
    pointerId: 1,
    button: 0,
    clientX: 980,
    clientY: 730,
  });
  fireEvent.pointerMove(button, { pointerId: 1, clientX: 50, clientY: 100 });
  fireEvent.pointerUp(button, { pointerId: 1, clientX: 50, clientY: 100 });
  fireEvent.click(button, { detail: 1 });
  expect(onOpen).not.toHaveBeenCalled();
  expect(onCornerChange).toHaveBeenLastCalledWith('top-left');
  fireEvent.pointerDown(button, {
    pointerId: 2,
    button: 0,
    clientX: 50,
    clientY: 100,
  });
  fireEvent.pointerUp(button, { pointerId: 2, clientX: 50, clientY: 100 });
  fireEvent.click(button, { detail: 1 });
  expect(onOpen).toHaveBeenCalledOnce();
});

it('supports keyboard positioning and hides the inactive anchor', () => {
  const onCornerChange = vi.fn();
  const props = {
    label: 'Resume Ask',
    buttonRef: null,
    onOpen: vi.fn(),
    onCornerChange,
  };
  const { rerender } = render(<FloatingAnchor {...props} active />);
  fireEvent.keyDown(screen.getByRole('button'), { key: 'ArrowLeft' });
  expect(onCornerChange).toHaveBeenCalledOnce();
  rerender(<FloatingAnchor {...props} active={false} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('animates the lens icon when hovering the anchor and lets the cycle finish on leave', () => {
  const onOpen = vi.fn();
  render(
    <FloatingAnchor
      active
      label="Resume Ask"
      buttonRef={null}
      onOpen={onOpen}
      onCornerChange={vi.fn()}
    />
  );
  const button = screen.getByRole('button', { name: 'Resume Ask' });
  expect(button.querySelector('filter')).toBeNull();
  fireEvent.mouseEnter(button);
  expect(button.querySelector('filter')).not.toBeNull();
  fireEvent.mouseLeave(button);
  expect(button.querySelector('filter')).not.toBeNull();
  expect(onOpen).not.toHaveBeenCalled();
});
