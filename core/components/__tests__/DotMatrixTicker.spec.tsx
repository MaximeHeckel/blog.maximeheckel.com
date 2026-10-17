import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { DotMatrixTicker } from '../DotMatrixTicker';

const preferences = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock('motion/react', () => ({
  useReducedMotion: () => preferences.reducedMotion,
}));

const makeContext = () => ({
  clearRect: vi.fn(),
  measureText: vi.fn(() => ({
    width: 36,
    actualBoundingBoxAscent: 30,
    actualBoundingBoxDescent: 8,
  })),
  fillText: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(120 * 66 * 4) })),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  getTransform: vi.fn(() => ({ a: 1 })),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
});

let contexts: ReturnType<typeof makeContext>[];
let frames: Map<number, FrameRequestCallback>;
let resize: () => void;
let intersect: (visible: boolean) => void;
let resolveFonts: () => void;
let hidden: boolean;
let width: number;
let frameId: number;
const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts');

const fontsReady = () => act(async () => resolveFonts());
const step = (time: number) => {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(time));
  });
};
const mask = () => contexts.at(-2)!;
const bloom = () => contexts.at(-3)!;

beforeEach(() => {
  preferences.reducedMotion = false;
  contexts = [];
  frames = new Map();
  hidden = false;
  width = 120;
  frameId = 0;

  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {
      check: vi.fn(() => true),
      load: vi.fn(() => Promise.resolve([])),
      ready: new Promise<void>((resolve) => {
        resolveFonts = resolve;
      }),
    },
  });
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.spyOn(
    HTMLCanvasElement.prototype,
    'getBoundingClientRect'
  ).mockImplementation(() => new DOMRect(0, 0, width, 64));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    (() => {
      const context = makeContext();
      contexts.push(context);

      return context;
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext
  );
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);

    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    }
  );
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
      observe() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts);
  else Reflect.deleteProperty(document, 'fonts');
});

it('keeps elapsed time while skipping rasterization, readback, and bloom within a step', async () => {
  render(<DotMatrixTicker text="Ada" />);
  await fontsReady();

  expect(mask().getImageData).toHaveBeenCalledTimes(1);
  expect(bloom().drawImage).toHaveBeenCalledTimes(1);

  step(1000);
  step(1050);
  step(1100);
  expect(mask().getImageData).toHaveBeenCalledTimes(1);
  expect(bloom().drawImage).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(1);

  step(1150);
  expect(mask().getImageData).toHaveBeenCalledTimes(2);
  expect(bloom().drawImage).toHaveBeenCalledTimes(2);
  expect(mask().fillText).toHaveBeenCalledWith('ADA   •   ', -9, 43);

  for (let time = 1200; time <= 1600; time += 50) step(time);

  expect(mask().getImageData).toHaveBeenCalledTimes(5);
  expect(mask().fillText.mock.calls.at(-4)?.[1]).toBe(-0);
});

it('redraws color cycling and supporter updates without waiting for a new step', async () => {
  const { rerender } = render(<DotMatrixTicker text="Ada" />);
  await fontsReady();
  const button = screen.getByRole('button', { name: /Supporters: Ada/ });
  const initialMask = mask();

  fireEvent.click(button);
  await act(async () => {});
  expect(mask()).not.toBe(initialMask);
  expect(mask().getImageData).toHaveBeenCalledTimes(1);

  rerender(<DotMatrixTicker text="Grace 2 coffees" color="red" />);
  await act(async () => {});
  expect(screen.getByRole('button')).toHaveAccessibleName(
    'Supporters: Grace 2 coffees'
  );
  expect(mask().fillText).toHaveBeenCalledWith(
    'GRACE 2 COFFEES   •   ',
    -0,
    43
  );
  expect(mask().getImageData).toHaveBeenCalledTimes(1);
});

it('redraws after resize even at the same offset', async () => {
  render(<DotMatrixTicker text="Ada" />);
  await fontsReady();

  act(resize);
  expect(mask().getImageData).toHaveBeenCalledTimes(2);

  width = 90;
  mask().measureText.mockReturnValue({
    width: 54,
    actualBoundingBoxAscent: 20,
    actualBoundingBoxDescent: 4,
  });
  act(resize);
  expect(mask().getImageData).toHaveBeenCalledTimes(3);
  expect(mask().fillText).toHaveBeenLastCalledWith('ADA   •   ', 54, 40);
  expect(screen.getByRole('button').querySelector('canvas')).toHaveAttribute(
    'width',
    '90'
  );
});

it.each(['hidden', 'offscreen'] as const)(
  'pauses while %s and resumes without accumulating paused time',
  async (pause) => {
    render(<DotMatrixTicker text="Ada" />);
    await fontsReady();
    step(1000);
    step(1050);

    const setPaused = (paused: boolean) =>
      act(() => {
        if (pause === 'hidden') {
          hidden = paused;
          document.dispatchEvent(new Event('visibilitychange'));
        } else intersect(!paused);
      });

    setPaused(true);
    expect(frames.size).toBe(0);
    step(5000);
    expect(mask().getImageData).toHaveBeenCalledTimes(1);

    setPaused(false);
    expect(frames.size).toBe(1);
    expect(mask().getImageData).toHaveBeenCalledTimes(1);
    step(10000);
    step(10050);
    expect(mask().getImageData).toHaveBeenCalledTimes(1);
    step(10100);
    expect(mask().getImageData).toHaveBeenCalledTimes(2);
    expect(mask().fillText).toHaveBeenCalledWith('ADA   •   ', -9, 43);
  }
);

it.each(['reduced motion', 'zero speed'] as const)(
  'draws a static display with %s and still redraws on color and resize',
  async (mode) => {
    preferences.reducedMotion = mode === 'reduced motion';
    render(
      <DotMatrixTicker text="Ada" speed={mode === 'zero speed' ? 0 : 2} />
    );
    await fontsReady();
    expect(mask().getImageData).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);

    fireEvent.click(screen.getByRole('button'));
    await act(async () => {});
    expect(mask().getImageData).toHaveBeenCalledTimes(1);
    act(resize);
    expect(mask().getImageData).toHaveBeenCalledTimes(2);
    expect(frames.size).toBe(0);
  }
);

it('waits for fonts before drawing and cancels animation on unmount', async () => {
  const { unmount } = render(<DotMatrixTicker text="Ada" />);
  expect(mask().getImageData).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);

  await fontsReady();
  expect(mask().getImageData).toHaveBeenCalledTimes(1);
  unmount();
  expect(mask().getImageData).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(0);
});

it('does not draw if unmounted before fonts are ready', async () => {
  const { unmount } = render(<DotMatrixTicker text="Ada" />);
  const context = mask();
  unmount();
  await fontsReady();
  expect(context.getImageData).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);
});

it.each([false, true])(
  'refreshes a late font load unless unmounted=%s',
  async (unmounted) => {
    let completeFont: (fonts: FontFace[]) => void = () => {};
    vi.spyOn(document.fonts, 'check').mockReturnValue(false);
    vi.spyOn(document.fonts, 'load').mockReturnValue(
      new Promise((resolve) => {
        completeFont = resolve;
      })
    );
    const { unmount } = render(<DotMatrixTicker text="Ada" />);
    await fontsReady();
    const context = mask();
    expect(context.getImageData).toHaveBeenCalledTimes(1);
    expect(document.fonts.load).toHaveBeenCalledTimes(1);

    context.measureText.mockReturnValue({
      width: 54,
      actualBoundingBoxAscent: 20,
      actualBoundingBoxDescent: 4,
    });
    vi.mocked(document.fonts.check).mockReturnValue(true);

    if (unmounted) unmount();

    await act(async () => completeFont([]));
    expect(context.getImageData).toHaveBeenCalledTimes(unmounted ? 1 : 2);

    if (!unmounted)
      expect(context.fillText).toHaveBeenCalledWith('ADA   •   ', -0, 40);
  }
);
