import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Diagram } from '../Diagram';

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => true,
  useInView: () => true,
}));

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const setup = () => {
  render(
    <Diagram
      label="Light bounce"
      steps={[
        { title: 'First', description: 'First pose', state: { x: 0 } },
        { title: 'Second', description: 'Second pose', state: { x: 1 } },
        { title: 'Third', description: 'Third pose', state: { x: 2 } },
      ]}
    >
      {() => <circle r={10} />}
    </Diagram>
  );
  return screen.getByRole('img', { name: 'Light bounce' });
};

const touch = (x: number, y = 100, identifier = 1) => ({
  identifier,
  clientX: x,
  clientY: y,
});

const swipe = (stage: Element, dx: number, dy = 0) => {
  fireEvent.touchStart(stage, { touches: [touch(200)] });
  fireEvent.touchMove(stage, { touches: [touch(200 + dx, 100 + dy)] });
  fireEvent.touchEnd(stage, {
    touches: [],
    changedTouches: [touch(200 + dx, 100 + dy)],
  });
};

it('advances on left swipes, goes back on right swipes, and stops at the ends', () => {
  const stage = setup();
  swipe(stage, 100);
  expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 3');
  swipe(stage, -100);
  expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3');
  swipe(stage, -100);
  swipe(stage, -100);
  expect(screen.getByRole('status')).toHaveTextContent('Step 3 of 3');
  expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();
  swipe(stage, 100);
  expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3');
  fireEvent.click(screen.getByRole('button', { name: 'Reset diagram' }));
  fireEvent.keyDown(stage, { key: 'ArrowRight' });
  expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3');
});

it('ignores taps, small movements, vertical scrolls, and diagonal gestures', () => {
  const stage = setup();
  for (const [dx, dy] of [
    [0, 0],
    [-30, 0],
    [-20, 100],
    [-80, 70],
  ]) {
    swipe(stage, dx, dy);
    expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 3');
  }
});

it('does not navigate after a scroll turns horizontal, a pinch, or a cancellation', () => {
  const stage = setup();
  fireEvent.touchStart(stage, { touches: [touch(200)] });
  fireEvent.touchMove(stage, { touches: [touch(190, 150)] });
  fireEvent.touchEnd(stage, { touches: [], changedTouches: [touch(50, 150)] });
  expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 3');

  fireEvent.touchStart(stage, { touches: [touch(200)] });
  fireEvent.touchStart(stage, { touches: [touch(200), touch(250, 100, 2)] });
  fireEvent.touchEnd(stage, {
    touches: [touch(200)],
    changedTouches: [touch(250, 100, 2)],
  });
  fireEvent.touchEnd(stage, { touches: [], changedTouches: [touch(50)] });
  expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 3');

  fireEvent.touchStart(stage, { touches: [touch(200)] });
  fireEvent.touchCancel(stage);
  fireEvent.touchEnd(stage, { touches: [], changedTouches: [touch(50)] });
  expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 3');
  swipe(stage, -100);
  expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3');
});

it('cancels browser horizontal gestures while leaving scrolling and pinching native', () => {
  const stage = setup();
  fireEvent.touchStart(stage, { touches: [touch(200)] });
  expect(
    fireEvent.touchMove(stage, { touches: [touch(205)], cancelable: true })
  ).toBe(false);
  fireEvent.touchEnd(stage, { touches: [], changedTouches: [touch(300)] });

  fireEvent.touchStart(stage, { touches: [touch(200)] });
  expect(
    fireEvent.touchMove(stage, { touches: [touch(200, 150)], cancelable: true })
  ).toBe(true);

  fireEvent.touchStart(stage, { touches: [touch(200), touch(250, 100, 2)] });
  expect(
    fireEvent.touchMove(stage, {
      touches: [touch(180), touch(270, 100, 2)],
      cancelable: true,
    })
  ).toBe(true);
});
