import { describe, expect, it } from 'vitest';

import { dot, mix, multiply, subtract } from '../geometry';
import {
  BOUNCE_HITS,
  BOUNCE_PATH,
  BOUNCE_SPHERE,
  BOUNCE_LIGHT,
  BOUNCE_STEPS,
  sphereFacesLight,
  growingRay,
} from '../lightBounceScene';
import { CUBE, SLAB } from '../raymarchingScene';

describe('Diffuse multi-bounce path', () => {
  it('arrives and scatters in the outward hemisphere at every bounce', () => {
    BOUNCE_HITS.forEach(({ point, normal }, i) => {
      expect(dot(subtract(BOUNCE_PATH[i], point), normal)).toBeGreaterThan(0);
      if (i + 1 < BOUNCE_HITS.length) {
        expect(
          dot(subtract(BOUNCE_HITS[i + 1].point, point), normal)
        ).toBeGreaterThan(0);
      }
    });
  });

  it('places every hit on its named surface', () => {
    expect(BOUNCE_HITS[0].point[0]).toBe(CUBE.min[0]);
    expect(BOUNCE_HITS[1].point[1]).toBe(SLAB.max[1]);
    expect(
      Math.hypot(...subtract(BOUNCE_HITS[2].point, BOUNCE_SPHERE.center))
    ).toBeCloseTo(BOUNCE_SPHERE.radius);
    expect(BOUNCE_HITS[3].point[1]).toBe(SLAB.max[1]);
  });

  it('does not pass through any solid between hits', () => {
    BOUNCE_PATH.slice(1).forEach((end, i) => {
      for (let sample = 1; sample < 100; sample++) {
        const point = mix(BOUNCE_PATH[i], end, sample / 100);
        expect(point[1]).toBeGreaterThan(SLAB.max[1]);
        expect(
          point.every(
            (value, axis) => value > CUBE.min[axis] && value < CUBE.max[axis]
          )
        ).toBe(false);
        expect(
          Math.hypot(...subtract(point, BOUNCE_SPHERE.center))
        ).toBeGreaterThan(BOUNCE_SPHERE.radius);
      }
    });
  });
});

it('hatches the side facing away from the actual light source', () => {
  const direction = subtract(BOUNCE_LIGHT, BOUNCE_SPHERE.center);
  const normal = multiply(direction, 1 / Math.hypot(...direction));
  expect(sphereFacesLight(normal)).toBe(true);
  expect(sphereFacesLight(multiply(normal, -1))).toBe(false);
});

it('reveals the direct ray before any bounce', () => {
  expect(BOUNCE_STEPS.map(({ state }) => state.progress)).toEqual([
    0, 1, 2, 3, 4,
  ]);
});

it('grows the direct ray from a fixed point outside the light icon', () => {
  for (const progress of [0, 0.01, 0.25, 0.5, 1]) {
    const { start, end } = growingRay([0, 0], [100, 0], progress, 16);
    expect(start).toEqual([16, 0]);
    expect(end[0]).toBeCloseTo(16 + 76 * progress);
    expect(end[1]).toBe(0);
  }
});

it('keeps outgoing bounces outside the hit-point rings throughout growth', () => {
  for (const progress of [0, 0.01, 0.5, 1]) {
    const { start, end } = growingRay([0, 0], [0, 100], progress, 8);
    expect(start).toEqual([0, 8]);
    expect(end[1]).toBeCloseTo(8 + 84 * progress);
  }
});
