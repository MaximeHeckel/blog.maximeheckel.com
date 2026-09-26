import { expect, it } from 'vitest';

import {
  clampPoint,
  anchorShape,
  cornerForPoint,
  dragPoint,
  settlePoint,
} from '../geometry';

const viewport = { width: 1000, height: 800 };

it('gradually dissolves weak contact without a cutoff jump', () => {
  let previous = 1;
  for (let distance = 0; distance <= 25; distance += 0.1) {
    const shape = anchorShape({ x: distance, y: 300 }, viewport);
    expect(shape.attachmentOpacity).toBeLessThanOrEqual(previous);
    expect(previous - shape.attachmentOpacity).toBeLessThan(0.01);
    previous = shape.attachmentOpacity;
  }
  expect(previous).toBe(0);
  expect(anchorShape({ x: 8, y: 300 }, viewport).attachmentOpacity).toBe(1);
  expect(
    anchorShape({ x: 20, y: 300 }, viewport).attachmentOpacity
  ).toBeLessThan(0.2);
});

it('restores the same capsule after detaching from any edge', () => {
  const original = anchorShape({ x: 400, y: 300 }, viewport);
  for (const point of [
    { x: 30, y: 300 },
    { x: 922, y: 300 },
    { x: 400, y: 30 },
    { x: 400, y: 730 },
    { x: 60, y: 300 },
    { x: 892, y: 300 },
    { x: 400, y: 60 },
    { x: 400, y: 700 },
  ]) {
    expect(anchorShape(point, viewport)).toEqual(original);
  }
  expect(original.path).toContain('A 20 20');
});

it('fully attaches while dragging close to any edge and releases farther away', () => {
  expect(dragPoint({ x: 10, y: 300 }, viewport)).toEqual({ x: 0, y: 300 });
  expect(dragPoint({ x: 942, y: 300 }, viewport)).toEqual({ x: 952, y: 300 });
  expect(dragPoint({ x: 400, y: 10 }, viewport)).toEqual({ x: 400, y: 0 });
  expect(dragPoint({ x: 400, y: 750 }, viewport)).toEqual({ x: 400, y: 760 });
  expect(dragPoint({ x: 60, y: 300 }, viewport)).toEqual({ x: 60, y: 300 });
  const approaching = dragPoint({ x: 28, y: 300 }, viewport);
  expect(approaching.x).toBeGreaterThan(0);
  expect(approaching.x).toBeLessThan(28);
});

it.each([
  [
    { x: 20, y: 300 },
    { x: 0, y: 300 },
  ],
  [
    { x: 918, y: 300 },
    { x: 952, y: 300 },
  ],
  [
    { x: 400, y: 25 },
    { x: 400, y: 0 },
  ],
  [
    { x: 400, y: 720 },
    { x: 400, y: 760 },
  ],
  [
    { x: 400, y: 300 },
    { x: 400, y: 300 },
  ],
])('settles %o near an edge without moving free anchors', (point, expected) => {
  expect(settlePoint(point, viewport)).toEqual(expected);
});

it.each([
  [{ x: 100, y: 100 }, 'top-left'],
  [{ x: 800, y: 100 }, 'top-right'],
  [{ x: 100, y: 600 }, 'bottom-left'],
  [{ x: 800, y: 600 }, 'bottom-right'],
])('opens in the quadrant containing %o', (point, corner) => {
  expect(cornerForPoint(point, viewport)).toBe(corner);
});

it('keeps the anchor reachable after a smaller viewport and detaches away from edges', () => {
  expect(clampPoint({ x: 900, y: 700 }, { width: 390, height: 600 })).toEqual({
    x: 334,
    y: 552,
  });
  const free = anchorShape({ x: 400, y: 300 }, viewport);
  const docked = anchorShape({ x: 952, y: 300 }, viewport);
  expect(free.iconX).toBe(0);
  expect(docked.iconX).toBe(4);
  expect(docked.path).not.toBe(free.path);
});
