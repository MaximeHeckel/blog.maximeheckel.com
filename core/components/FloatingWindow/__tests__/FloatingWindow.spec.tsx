import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';

import { FloatingWindow, FloatingWindowState } from '..';

it('keeps drafts through minimizing and closing without blocking the page', async () => {
  const read = vi.fn();
  const Example = () => {
    const [state, setState] = useState<FloatingWindowState>('closed');
    return (
      <>
        <button onClick={() => setState('open')}>Open Ask</button>
        <button onClick={read}>Article interaction</button>
        <button onClick={() => setState('closed')}>
          Close panel externally
        </button>
        <FloatingWindow title="Ask" state={state} onStateChange={setState}>
          <textarea aria-label="Draft" />
        </FloatingWindow>
      </>
    );
  };
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Open Ask' });
  trigger.focus();
  fireEvent.click(trigger);
  await waitFor(() =>
    expect(screen.getByRole('dialog', { name: 'Ask' })).toHaveFocus()
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Draft' }), {
    target: { value: 'Explain this' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Article interaction' }));
  expect(read).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Minimize Ask' }));
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Resume Ask' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Resume Ask' }));
  expect(screen.getByRole('textbox')).toHaveValue('Explain this');
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Close Ask' }));
  expect(
    screen.queryByRole('button', { name: 'Resume Ask' })
  ).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(screen.getByRole('textbox')).toHaveValue('Explain this');
});

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('shows Latest for overflow, updates as text grows, and scrolls to the bottom', async () => {
  let resize!: ResizeObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe = observe;
      disconnect = disconnect;
    }
  );
  const { unmount } = render(
    <FloatingWindow
      title="Ask"
      state="open"
      onStateChange={vi.fn()}
      showScrollToLatest
    >
      <p>Response text</p>
    </FloatingWindow>
  );
  const body = screen.getByText('Response text').parentElement!.parentElement!;
  Object.defineProperties(body, {
    scrollHeight: { configurable: true, value: 800 },
    clientHeight: { configurable: true, value: 400 },
    scrollTop: { configurable: true, writable: true, value: 0 },
  });
  const scrollTo = vi.fn();
  body.scrollTo = scrollTo;
  expect(
    screen.queryByRole('button', { name: 'Scroll to latest' })
  ).not.toBeInTheDocument();

  act(() => resize([], {} as ResizeObserver));
  fireEvent.click(screen.getByRole('button', { name: 'Scroll to latest' }));
  expect(scrollTo).toHaveBeenCalledWith({ top: 800, behavior: 'smooth' });

  body.scrollTop = 400;
  fireEvent.scroll(body);
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Scroll to latest' })
    ).not.toBeInTheDocument()
  );

  Object.defineProperty(body, 'scrollHeight', {
    configurable: true,
    value: 1000,
  });
  act(() => resize([], {} as ResizeObserver));
  expect(
    screen.getByRole('button', { name: 'Scroll to latest' })
  ).toBeInTheDocument();

  Object.defineProperty(body, 'clientHeight', {
    configurable: true,
    value: 1000,
  });
  body.scrollTop = 0;
  act(() => resize([], {} as ResizeObserver));
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Scroll to latest' })
    ).not.toBeInTheDocument()
  );
  unmount();
  expect(disconnect).toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it('starts at half the viewport and preserves keyboard resizing across minimize and restore', () => {
  vi.stubGlobal('innerHeight', 1000);
  const panel = (state: FloatingWindowState) => (
    <FloatingWindow title="Ask" state={state} onStateChange={vi.fn()}>
      <p>Response</p>
    </FloatingWindow>
  );
  const { rerender } = render(panel('open'));
  const handle = screen.getByRole('separator', { name: 'Resize Ask height' });
  expect(handle).toHaveAttribute('aria-valuenow', '500');
  fireEvent.keyDown(handle, { key: 'ArrowUp' });
  expect(handle).toHaveAttribute('aria-valuenow', '532');
  fireEvent.keyDown(handle, { key: 'ArrowDown' });
  expect(handle).toHaveAttribute('aria-valuenow', '500');
  fireEvent.keyDown(handle, { key: 'End' });
  expect(handle).toHaveAttribute('aria-valuenow', '984');
  rerender(panel('minimized'));
  rerender(panel('open'));
  expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '984');
  fireEvent.keyDown(handle, { key: 'Home' });
  expect(handle).toHaveAttribute('aria-valuenow', '420');
});

it('resizes by dragging and clamps the chosen height when the viewport shrinks', () => {
  vi.stubGlobal('innerHeight', 1000);
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId = 1;
    }
  );
  render(
    <FloatingWindow title="Ask" state="open" onStateChange={vi.fn()}>
      <p>Response</p>
    </FloatingWindow>
  );
  const handle = screen.getByRole('separator', { name: 'Resize Ask height' });
  handle.setPointerCapture = vi.fn();
  handle.hasPointerCapture = vi.fn().mockReturnValue(true);
  handle.releasePointerCapture = vi.fn();
  const previouslyFocused = document.activeElement;
  fireEvent.pointerDown(handle, { button: 0, clientY: 500 });
  expect(handle).not.toHaveFocus();
  expect(document.activeElement).toBe(previouslyFocused);
  fireEvent.pointerMove(handle, { clientY: 350 });
  expect(handle).toHaveAttribute('aria-valuenow', '650');
  fireEvent.pointerUp(handle);
  expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
  fireEvent.pointerMove(handle, { clientY: 300 });
  expect(handle).toHaveAttribute('aria-valuenow', '650');
  vi.stubGlobal('innerHeight', 400);
  fireEvent(window, new Event('resize'));
  expect(handle).toHaveAttribute('aria-valuenow', '384');
});

it('keeps the default height at least 420px when half the viewport is smaller', () => {
  vi.stubGlobal('innerHeight', 800);
  render(
    <FloatingWindow title="Ask" state="open" onStateChange={vi.fn()}>
      <p>Response</p>
    </FloatingWindow>
  );
  const handle = screen.getByRole('separator', { name: 'Resize Ask height' });
  expect(handle).toHaveAttribute('aria-valuemin', '420');
  expect(handle).toHaveAttribute('aria-valuenow', '420');
  fireEvent.keyDown(handle, { key: 'ArrowDown' });
  expect(handle).toHaveAttribute('aria-valuenow', '420');
});

it('scrolls for each new response without forcing scroll on streaming updates', () => {
  const panel = (request?: string, text = 'Thinking…') => (
    <FloatingWindow
      title="Ask"
      state="open"
      onStateChange={vi.fn()}
      scrollToBottomRequest={request}
    >
      <p>{text}</p>
    </FloatingWindow>
  );
  const { rerender } = render(panel());
  const body = screen.getByText('Thinking…').parentElement!.parentElement!;
  Object.defineProperty(body, 'scrollHeight', {
    configurable: true,
    value: 1200,
  });
  body.scrollTo = vi.fn();
  rerender(panel('response-1'));
  expect(body.scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: 'smooth' });
  rerender(panel('response-1', 'Writing the answer'));
  expect(body.scrollTo).toHaveBeenCalledTimes(1);
  rerender(panel(undefined, 'Completed answer'));
  rerender(panel('response-2'));
  expect(body.scrollTo).toHaveBeenCalledTimes(2);
});

it.each([false, true])(
  'follows short responses and stops at the question or manual scroll (manual: %s)',
  (manual) => {
    let resize!: ResizeObserverCallback;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe() {}
        disconnect() {}
      }
    );
    const boundary = { current: null as HTMLElement | null };
    const panel = (request?: string) => (
      <FloatingWindow
        title="Ask"
        state="open"
        onStateChange={vi.fn()}
        scrollToBottomRequest={request}
        scrollBoundaryRef={boundary}
      >
        <p
          ref={(node) => {
            boundary.current = node;
          }}
        >
          Latest question
        </p>
        <p>Answer</p>
      </FloatingWindow>
    );
    const { rerender } = render(panel());
    const body = screen.getByText('Answer').parentElement!.parentElement!;
    Object.defineProperties(body, {
      scrollHeight: { configurable: true, value: 800 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, writable: true, value: 0 },
    });
    vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 400, 400)
    );
    vi.spyOn(boundary.current!, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(0, 600 - body.scrollTop, 400, 60)
    );
    rerender(panel('answer-1'));
    expect(body.scrollTop).toBe(400);
    Object.defineProperty(body, 'scrollHeight', {
      configurable: true,
      value: 900,
    });
    act(() => resize([], {} as ResizeObserver));
    expect(body.scrollTop).toBe(500);
    if (manual) {
      body.scrollTop = 450;
      fireEvent.scroll(body);
    }
    Object.defineProperty(body, 'scrollHeight', {
      configurable: true,
      value: 1200,
    });
    act(() => resize([], {} as ResizeObserver));
    expect(body.scrollTop).toBe(manual ? 450 : 660);
    Object.defineProperty(body, 'scrollHeight', {
      configurable: true,
      value: 1600,
    });
    act(() => resize([], {} as ResizeObserver));
    expect(body.scrollTop).toBe(manual ? 450 : 660);
  }
);
