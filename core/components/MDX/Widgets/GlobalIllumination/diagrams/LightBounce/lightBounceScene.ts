import { DiagramStep } from '../shared/Diagram';
import {
  Point2,
  Point3,
  add,
  dot,
  multiply,
  subtract,
} from '../shared/geometry';
import { SLAB } from '../shared/scene';

export const BOUNCE_SPHERE = {
  center: [-2.6, SLAB.max[1] + 0.65, 0.2] as Point3,
  radius: 0.65,
};
const sphereNormal: Point3 = [0.8, -0.5, -Math.sqrt(0.11)];
export const BOUNCE_LIGHT: Point3 = [-1.2, 3.1, 1.4];

// One possible diffuse path, not a mirror reflection or all the scattered light.
// Normals and exact surface locations keep every segment in free space.
export const BOUNCE_HITS = [
  {
    point: [0, 1, -0.4] as Point3,
    normal: [-1, 0, 0] as Point3,
    surface: 'box',
  },
  {
    point: [-1.2, SLAB.max[1], -1.4] as Point3,
    normal: [0, 1, 0] as Point3,
    surface: 'slab',
  },
  {
    point: add(
      BOUNCE_SPHERE.center,
      multiply(sphereNormal, BOUNCE_SPHERE.radius)
    ),
    normal: sphereNormal,
    surface: 'sphere',
  },
  {
    point: [-2.3, SLAB.max[1], -1.8] as Point3,
    normal: [0, 1, 0] as Point3,
    surface: 'slab',
  },
];
export const BOUNCE_PATH = [
  BOUNCE_LIGHT,
  ...BOUNCE_HITS.map(({ point }) => point),
];

type BounceState = { progress: number };
export const BOUNCE_STEPS = [
  {
    title: 'View the scene',
    description:
      'A light source illuminates a box and a sphere resting on the slab. Advance to follow a ray from the light.',
    state: { progress: 0 },
  },
  {
    title: 'Direct light',
    description:
      'Light from the source first reaches the box. This is direct illumination.',
    state: { progress: 1 },
  },
  {
    title: 'First bounce',
    description:
      'The box scatters some of the incoming light onto the slab. This is indirect illumination.',
    state: { progress: 2 },
  },
  {
    title: 'Second bounce',
    description:
      'Light reflected by the slab reaches the sphere. Light keeps traveling after its first bounce.',
    state: { progress: 3 },
  },
  {
    title: 'Third bounce',
    description:
      'The sphere scatters light back onto another part of the slab. This is one possible diffuse path; each surface scatters in many directions and absorbs some light.',
    state: { progress: 4 },
  },
] satisfies [DiagramStep<BounceState>, ...DiagramStep<BounceState>[]];

/** A point light illuminates a sphere point only when it is above its tangent plane. */
export function sphereFacesLight(normal: Point3) {
  const point = add(
    BOUNCE_SPHERE.center,
    multiply(normal, BOUNCE_SPHERE.radius)
  );
  return dot(normal, subtract(BOUNCE_LIGHT, point)) > 0;
}

// Screen-space scanlines form only the unlit region; hatch lines stay fixed.
export function sphereShadowPath(
  eye: Point3,
  right: Point3,
  up: Point3,
  cx: number,
  cy: number,
  radius: number
) {
  const size = 192;
  const unit = (radius * 2) / size;
  let path = '';
  for (let row = 0; row < size; row++) {
    let start = -1;
    for (let column = 0; column <= size; column++) {
      const x = ((column + 0.5) * 2) / size - 1;
      const y = 1 - ((row + 0.5) * 2) / size;
      const zSquared = 1 - x * x - y * y;
      const shaded =
        column < size &&
        zSquared >= 0 &&
        !sphereFacesLight(
          add(
            add(multiply(right, x), multiply(up, y)),
            multiply(eye, Math.sqrt(zSquared))
          )
        );
      if (shaded && start < 0) start = column;
      if (!shaded && start >= 0) {
        path += `M${cx - radius + start * unit} ${cy - radius + row * unit}h${(column - start) * unit}v${unit}h${-(column - start) * unit}Z`;
        start = -1;
      }
    }
  }
  return path;
}

/** Crop the full ray first, then extend only its endpoint from a fixed origin. */
export function growingRay(
  from: Point2,
  to: Point2,
  progress: number,
  sourceGap = 0
) {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const ux = length > 0 ? (to[0] - from[0]) / length : 0;
  const uy = length > 0 ? (to[1] - from[1]) / length : 0;
  const startInset = Math.min(sourceGap, length / 3);
  const endInset = Math.min(8, length / 3);
  const start: Point2 = [from[0] + ux * startInset, from[1] + uy * startInset];
  const extension =
    (length - startInset - endInset) * Math.max(0, Math.min(1, progress));
  const end: Point2 = [start[0] + ux * extension, start[1] + uy * extension];
  return { start, end };
}
