import { describe, expect, it } from 'vitest';

import {
  COMPARISON_POINTS,
  LIGHT,
  LIGHTING_STEPS,
  LIGHT_POSITION,
  lightingProjection,
} from '../blinnPhongScene';
import { createProjection, dot } from '../geometry';

describe('Diffuse lighting comparison', () => {
  it('places A at the point of maximum diffuse light', () => {
    const aligned = COMPARISON_POINTS[0];
    expect(dot(aligned.normal, LIGHT)).toBeCloseTo(1);
    expect(aligned.diffuse).toBeCloseTo(1);
  });

  it('places B on the visible hemisphere facing away from the light', () => {
    const away = COMPARISON_POINTS[1];
    expect(away.normal[2]).toBeGreaterThan(0);
    expect(dot(away.normal, LIGHT)).toBeLessThan(0);
    expect(away.diffuse).toBe(0);
  });
});

it('turns each selected surface point toward the camera', () => {
  LIGHTING_STEPS.forEach(({ state }) => {
    const { eye } = createProjection(
      { width: 736, height: 490 },
      {
        ...state,
        zoom: 1,
        target: [0, 0, 0],
        span: [5.4, 4.6],
      }
    );
    const facing = dot(COMPARISON_POINTS[state.focus].normal, eye);
    expect(facing).toBeGreaterThan(0.65);
    // A stays oblique enough that the aligned arrows are not foreshortened.
    if (state.focus === 0) expect(facing).toBeLessThan(0.85);
  });
});

it('keeps the light inside the card throughout the orbit without clamping', () => {
  for (const viewport of [
    { width: 288, height: 410 },
    { width: 664, height: 490 },
  ]) {
    const from = LIGHTING_STEPS[0].state;
    const to = LIGHTING_STEPS[3].state;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const { project } = lightingProjection(
        {
          azimuth: from.azimuth + (to.azimuth - from.azimuth) * t,
          elevation: from.elevation + (to.elevation - from.elevation) * t,
          focus: t,
          zoom: from.zoom,
          close: 0,
        },
        viewport
      );
      const [centerX, centerY] = project([0, 0, 0]);
      expect(centerX).toBeCloseTo(viewport.width / 2);
      expect(centerY).toBeCloseTo(viewport.height * 0.54);
      const [x, y] = project(LIGHT_POSITION);
      expect(x).toBeGreaterThan(24);
      expect(x + 70).toBeLessThan(viewport.width);
      expect(y).toBeGreaterThan(30);
      expect(y + 16).toBeLessThan(viewport.height);
    }
  }
});

it('pairs each wide view with a closer view of the same point', () => {
  for (const [wideIndex, closeIndex] of [
    [0, 1],
    [3, 2],
  ]) {
    const wide = LIGHTING_STEPS[wideIndex].state;
    const close = LIGHTING_STEPS[closeIndex].state;
    expect(close.azimuth).toBe(wide.azimuth);
    expect(close.elevation).toBe(wide.elevation);
    expect(close.focus).toBe(wide.focus);
    expect(close.zoom).toBeGreaterThan(wide.zoom);
    const { project } = lightingProjection(close, { width: 664, height: 490 });
    const [x, y] = project(COMPARISON_POINTS[close.focus].normal);
    expect(Math.abs(x - 332)).toBeLessThan(50);
    expect(Math.abs(y - 490 * 0.54)).toBeLessThan(50);
  }
});

it('holds the close-up zoom while rotating from A to B', () => {
  expect(LIGHTING_STEPS[1].state.zoom).toBe(LIGHTING_STEPS[2].state.zoom);
  expect(LIGHTING_STEPS[1].state.close).toBe(LIGHTING_STEPS[2].state.close);
});
