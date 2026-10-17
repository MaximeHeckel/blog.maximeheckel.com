import { act, fireEvent, render } from '@testing-library/react';
import { Highlight } from 'prism-react-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import CodeBlock from '../CodeBlock';

vi.mock('prism-react-renderer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('prism-react-renderer')>();

  return { ...actual, Highlight: vi.fn(actual.Highlight) };
});

let intersect: (visible: boolean) => void;
let resize: () => void;
const disconnectResize = vi.fn();
const disconnectIntersection = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = (visible) =>
          callback(
            [{ isIntersecting: visible } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver
          );
      }

      observe = vi.fn();
      disconnect = disconnectIntersection;
    }
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = () => callback([], this as unknown as ResizeObserver);
      }

      observe = vi.fn();
      disconnect = disconnectResize;
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderCode = (codeString = 'const value = 1;') =>
  render(
    <CodeBlock
      codeString={codeString}
      language="javascript"
      metastring={null}
    />
  );

it('defers offscreen measurements and updates shadows on scroll and resize', () => {
  const { container } = renderCode();
  const pre = container.querySelector('pre')!;
  let contentWidth = 800;
  const readWidth = vi.fn(() => contentWidth);

  Object.defineProperties(pre, {
    scrollWidth: { configurable: true, get: readWidth },
    clientWidth: { configurable: true, value: 400 },
  });

  expect(readWidth).not.toHaveBeenCalled();

  act(() => intersect(true));

  expect(readWidth).toHaveBeenCalledTimes(1);
  expect(pre.style.getPropertyValue('--shadow-opacity-left')).toBe('0');
  expect(pre.style.getPropertyValue('--shadow-opacity-right')).toBe('1');

  pre.scrollLeft = 30;
  fireEvent.scroll(pre);

  expect(pre.style.getPropertyValue('--shadow-opacity-left')).toBe('0.5');
  expect(pre.style.getPropertyValue('--shadow-opacity-right')).toBe('0.5');
  expect(readWidth).toHaveBeenCalledTimes(1);

  contentWidth = 300;
  act(() => resize());

  expect(pre.style.getPropertyValue('--shadow-opacity-left')).toBe('0');
  expect(pre.style.getPropertyValue('--shadow-opacity-right')).toBe('0');

  act(() => intersect(false));
  readWidth.mockClear();
  act(() => resize());
  fireEvent.scroll(pre);

  expect(readWidth).not.toHaveBeenCalled();
  expect(disconnectResize).toHaveBeenCalled();

  contentWidth = 900;
  act(() => intersect(true));

  expect(readWidth).toHaveBeenCalledTimes(1);
  expect(pre.style.getPropertyValue('--shadow-opacity-right')).toBe('0.5');
});

it('keeps token markup stable when code actions appear or gain focus', () => {
  const { container, getByRole, rerender } = renderCode();
  const card = container.querySelector('[data-code-block]')!;
  const pre = container.querySelector('pre')!;
  const markup = pre.innerHTML;

  vi.mocked(Highlight).mockClear();
  fireEvent.pointerEnter(card);
  fireEvent.focus(getByRole('button', { name: 'Copy code to clipboard' }));
  fireEvent.pointerLeave(card);

  expect(Highlight).not.toHaveBeenCalled();
  expect(pre.innerHTML).toBe(markup);

  rerender(
    <CodeBlock
      codeString="const value = 2;"
      language="javascript"
      metastring="{1} title=Updated code"
    />
  );

  expect(Highlight).toHaveBeenCalled();
  expect(pre).toHaveTextContent('const value = 2;');
  expect(container.querySelector('.highlight-line')).toBeInTheDocument();
  expect(getByRole('button', { name: 'Copy code to clipboard' })).toBeVisible();
});

it('remeasures changed code only near the viewport and cleans up on unmount', () => {
  const { container, rerender, unmount } = renderCode('short');
  const pre = container.querySelector('pre')!;
  const readWidth = vi.fn(() => 800);

  Object.defineProperties(pre, {
    scrollWidth: { configurable: true, get: readWidth },
    clientWidth: { configurable: true, value: 400 },
  });

  rerender(
    <CodeBlock
      codeString="a much longer streamed code block"
      language="javascript"
      metastring={null}
    />
  );

  expect(readWidth).not.toHaveBeenCalled();
  act(() => intersect(true));

  expect(pre.style.getPropertyValue('--shadow-opacity-right')).toBe('1');

  unmount();
  readWidth.mockClear();
  act(() => resize());
  fireEvent.scroll(pre);

  expect(readWidth).not.toHaveBeenCalled();
  expect(disconnectIntersection).toHaveBeenCalled();
  expect(disconnectResize).toHaveBeenCalled();
});

it('copies updated source after the highlighted subtree has been memoized', () => {
  const copied: string[] = [];
  const execCommand = vi.fn(() => {
    copied.push(document.querySelector('textarea')!.value);

    return true;
  });
  const original = Object.getOwnPropertyDescriptor(document, 'execCommand');

  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  });

  try {
    const { getByRole, rerender } = renderCode();

    rerender(
      <CodeBlock
        codeString="const value = 2;"
        language="javascript"
        metastring={null}
      />
    );
    fireEvent.click(getByRole('button', { name: 'Copy code to clipboard' }));

    expect(copied).toEqual(['const value = 2;']);
    expect(document.querySelector('textarea')).not.toBeInTheDocument();
  } finally {
    if (original) Object.defineProperty(document, 'execCommand', original);
    else Reflect.deleteProperty(document, 'execCommand');
  }
});
