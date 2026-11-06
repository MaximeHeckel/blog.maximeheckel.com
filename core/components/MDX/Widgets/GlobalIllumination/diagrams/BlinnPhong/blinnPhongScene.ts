import { DiagramStep } from '../shared/Diagram';
import {
  Point3,
  Viewport,
  createProjection,
  dot,
  mix,
  multiply,
} from '../shared/geometry';

export const normalize = (v: Point3): Point3 =>
  multiply(v, 1 / Math.hypot(...v));
export const LIGHT = normalize([-0.65, 0.75, 1]);
export const COMPARISON_POINTS = [
  { id: 'A', normal: LIGHT, diffuse: Math.max(0, dot(LIGHT, LIGHT)) },
  {
    id: 'B',
    normal: normalize([0.8, -0.5, 0.33]),
    diffuse: Math.max(0, dot(normalize([0.8, -0.5, 0.33]), LIGHT)),
  },
];

export const LIGHT_POSITION = multiply(LIGHT, 2.65);

export function lightingProjection(state: CameraState, viewport: Viewport) {
  return createProjection(viewport, {
    azimuth: state.azimuth,
    elevation: state.elevation,
    zoom: state.zoom,
    // Orbit the sphere center; leave room for the fixed light on narrow screens.
    target: multiply(
      mix(
        COMPARISON_POINTS[0].normal,
        COMPARISON_POINTS[1].normal,
        state.focus
      ),
      state.close * 0.75
    ),
    span: [9, 4.6],
  });
}

type CameraState = {
  azimuth: number;
  elevation: number;
  focus: number;
  zoom: number;
  close: number;
};

export const LIGHTING_STEPS = [
  {
    title: 'A: aligned with the light',
    description:
      'The camera focuses on A, where the surface normal N aligns with the light direction L and diffuse light is strongest. Both arrows originate at A; L is drawn longer than N so their alignment is visible.',
    state: { azimuth: 80, elevation: 12, focus: 0, zoom: 1.85, close: 0 },
  },
  {
    title: 'A: close-up',
    description:
      'A closer view of A shows the normal and light direction aligned.',
    state: { azimuth: 80, elevation: 12, focus: 0, zoom: 3.3, close: 1 },
  },
  {
    title: 'B: facing away from the light',
    description:
      'The camera rotates to B. Its normal faces away from the same light, so it receives no diffuse light.',
    state: { azimuth: 42, elevation: -12, focus: 1, zoom: 3.3, close: 1 },
  },
  {
    title: 'B: wider view',
    description:
      'The camera zooms out to show B in the scene, still facing away from the light.',
    state: { azimuth: 42, elevation: -12, focus: 1, zoom: 1.85, close: 0 },
  },
] satisfies [DiagramStep<CameraState>, ...DiagramStep<CameraState>[]];
