import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import ImageAccordion from '..';

const preferences = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock('motion/react', async (original) => ({
  ...(await original<typeof import('motion/react')>()),
  useReducedMotion: () => preferences.reducedMotion,
}));

const images = Array.from({ length: 5 }, (_, index) => ({
  src: `blog/example-${index}.png`,
  alt: `Scene ${index + 1}`,
}));
let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let time: number;

beforeEach(() => {
  preferences.reducedMotion = false;
  frames = new Map();
  frameId = 0;
  time = 0;
  vi.stubGlobal('PointerEvent', MouseEvent);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const settle = () =>
  act(() => {
    for (let index = 0; index < 180 && frames.size; index++) {
      time += 16.67;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(time));
    }
  });

const cells = () => screen.getAllByRole('button');
const widths = () => cells().map((cell) => Number(cell.style.flexGrow));

it('opens the hovered image and spreads less movement into its neighbours', () => {
  render(<ImageAccordion images={images} />);
  expect(widths()).toEqual([20, 20, 20, 20, 20]);

  fireEvent.pointerOver(cells()[2]);
  settle();

  const [edge, neighbour, center, otherNeighbour, otherEdge] = widths();
  expect(center).toBeCloseTo(40);
  expect(neighbour).toBeGreaterThan(edge);
  expect(neighbour).toBeLessThan(center);
  expect(neighbour).toBeCloseTo(otherNeighbour);
  expect(edge).toBeCloseTo(otherEdge);
  expect(cells()[2]).toHaveAttribute('aria-expanded', 'true');
  expect(frames.size).toBe(0);
});

it('keeps the accordion open between cells and returns to rest outside', () => {
  render(<ImageAccordion images={images} />);
  fireEvent.pointerOver(cells()[0]);
  fireEvent.pointerOut(cells()[0], { relatedTarget: cells()[1] });
  expect(cells()[1]).toHaveAttribute('aria-expanded', 'true');

  fireEvent.pointerOver(cells()[1]);
  expect(cells()[1]).toHaveAttribute('aria-expanded', 'true');

  fireEvent.pointerOut(cells()[1], { relatedTarget: document.body });
  settle();
  expect(widths()).toEqual([20, 20, 20, 20, 20]);
});

it('opens for keyboard focus and closes when focus leaves', () => {
  render(<ImageAccordion images={images} />);
  fireEvent.focus(cells()[1]);
  expect(cells()[1]).toHaveAttribute('aria-expanded', 'true');

  fireEvent.blur(cells()[1], { relatedTarget: cells()[2] });
  fireEvent.focus(cells()[2]);
  expect(cells()[2]).toHaveAttribute('aria-expanded', 'true');

  fireEvent.blur(cells()[2], { relatedTarget: document.body });
  expect(
    cells().every((cell) => cell.getAttribute('aria-expanded') === 'false')
  ).toBe(true);
});

it('honours reduced motion without scheduling animation frames', () => {
  preferences.reducedMotion = true;
  render(<ImageAccordion images={images} />);
  fireEvent.pointerOver(cells()[2]);

  expect(widths()[2]).toBeCloseTo(40);
  expect(frames.size).toBe(0);
});

it.each([25, 50, 75, 100])(
  'gives the hovered image exactly %s percent, including with wide reach',
  (expandedWidth) => {
    preferences.reducedMotion = true;
    render(
      <ImageAccordion
        images={images}
        expandedWidth={expandedWidth}
        reach={100}
      />
    );
    fireEvent.pointerOver(cells()[2]);

    expect(widths()[2]).toBeCloseTo(expandedWidth);
    expect(widths().reduce((sum, share) => sum + share, 0)).toBeCloseTo(100);
  }
);

it('keeps equal widths when expansion is set below the resting share', () => {
  preferences.reducedMotion = true;
  render(<ImageAccordion images={images} expandedWidth={0} />);
  fireEvent.pointerOver(cells()[2]);
  expect(widths()).toEqual([20, 20, 20, 20, 20]);
});

it('resets a cancelled touch or pointer interaction', () => {
  render(<ImageAccordion images={images} />);
  fireEvent.click(cells()[3]);
  expect(cells()[3]).toHaveAttribute('aria-expanded', 'true');

  fireEvent.pointerCancel(screen.getByRole('group'));
  settle();
  expect(widths()).toEqual([20, 20, 20, 20, 20]);
});

it('handles a changing number of images and cancels pending animation on unmount', () => {
  const { rerender, unmount } = render(<ImageAccordion images={images} />);
  fireEvent.pointerOver(cells()[2]);
  expect(frames.size).toBeGreaterThan(0);

  rerender(<ImageAccordion images={images.slice(0, 3)} />);
  expect(cells()).toHaveLength(3);
  unmount();
  expect(frames.size).toBe(0);
});
