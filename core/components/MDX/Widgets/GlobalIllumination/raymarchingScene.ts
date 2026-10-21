import type { DiagramStep } from './Diagram';
import { Box3, Camera, Point3, intersectBox } from './geometry';

export const CAMERA: Camera = {
  azimuth: 225,
  elevation: 35.264,
  zoom: 1,
  target: [0, -0.1, 0.1],
  span: [9.4, 6.8],
};

export const SLAB: Box3 = {
  min: [-3.74, -0.1968, -2.76],
  max: [3.74, -0.012, 2.96],
};
export const CUBE: Box3 = { min: [0, 0, -0.65], max: [1.7, 1.7, 1.05] };
export const SURFACE_POINT: Point3 = [-1.05, 0.025, 0.3];

// Keep the original sample distribution and both cube hits, displaying only
// six rays for readability. Intersections are analytic, not depth-buffer tests:
// this diagram illustrates the sampling process rather than executing SSGI.
export const RAYS = Array.from({ length: 16 }, (_, id) => {
  const radius = Math.sqrt((id + 0.5) / 16);
  const angle = id * Math.PI * (3 - Math.sqrt(5)) + 0.3;
  const direction: Point3 = [
    radius * Math.cos(angle),
    Math.sqrt(1 - radius * radius),
    radius * Math.sin(angle),
  ];
  const hit = intersectBox(SURFACE_POINT, direction, CUBE);

  return { id, direction, hit, length: hit?.distance ?? 2.5 };
}).filter((ray) => ray.hit || [0, 4, 11, 15].includes(ray.id));

const INITIAL_STATE = {
  cameraElevation: CAMERA.elevation,
  cameraZoom: CAMERA.zoom,
  cameraTargetX: CAMERA.target[0],
  cameraTargetY: CAMERA.target[1],
  cameraTargetZ: CAMERA.target[2],
  hemisphereVisibility: 0,
  normalVisibility: 0,
  raysVisibility: 0,
  marchProgress: 0,
  markerVisibility: 0,
  gatherProgress: 0,
  shadeProgress: 0,
  pixelEmphasis: 1,
  hemisphereEmphasis: 0,
  rayEmphasis: 0,
  lightEmphasis: 0,
};

export type RaymarchingState = typeof INITIAL_STATE;
type Step = DiagramStep<RaymarchingState>;

const CLOSE_UP = {
  cameraElevation: 25,
  cameraZoom: 1.8,
  cameraTargetX: SURFACE_POINT[0],
  cameraTargetY: SURFACE_POINT[1] + 0.4,
  cameraTargetZ: SURFACE_POINT[2],
};

// All continuous values share the same eased transition, including color emphasis.
export const STEPS: readonly [Step, ...Step[]] = [
  {
    title: 'Choose a surface pixel',
    description:
      'The square marks the surface location whose indirect light we want to estimate.',
    state: INITIAL_STATE,
  },
  {
    title: 'Sample the hemisphere',
    description:
      'Sample several directions above the surface, favoring directions near its normal.',
    state: {
      ...INITIAL_STATE,
      ...CLOSE_UP,
      hemisphereVisibility: 1,
      normalVisibility: 1,
      raysVisibility: 1,
      pixelEmphasis: 0,
      hemisphereEmphasis: 1,
    },
  },
  {
    title: 'March along each ray',
    description:
      'Advance in small steps until a ray reaches a surface or runs out of range.',
    state: {
      ...INITIAL_STATE,
      hemisphereVisibility: 0.35,
      ...CLOSE_UP,
      raysVisibility: 1,
      marchProgress: 1,
      markerVisibility: 1,
      pixelEmphasis: 0,
      rayEmphasis: 1,
    },
  },
  {
    title: 'Gather reflected light',
    description:
      'Hits collect light reflected by the cube; misses contribute zero in this scene.',
    state: {
      ...INITIAL_STATE,
      ...CLOSE_UP,
      raysVisibility: 1,
      marchProgress: 1,
      gatherProgress: 1,
      pixelEmphasis: 0,
      lightEmphasis: 1,
    },
  },
  {
    title: 'Color the pixel',
    description:
      'Average the samples, including misses, and apply the surface’s diffuse color.',
    state: {
      ...INITIAL_STATE,
      raysVisibility: 1,
      marchProgress: 1,
      gatherProgress: 1,
      shadeProgress: 1,
    },
  },
];
