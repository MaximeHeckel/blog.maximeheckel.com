import { DiagramStep } from './Diagram';
import { add, multiply, Point3 } from './geometry';

const cross = (a: Point3, b: Point3): Point3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const normalize = (v: Point3) => multiply(v, 1 / Math.hypot(...v));

/** The same helper-axis selection and basis as GI5. */
export function samplingFrame(normal: Point3) {
  const n = normalize(normal);
  const axis: Point3 = Math.abs(n[2]) > 0.999 ? [0, 1, 0] : [0, 0, 1];
  const tangent = normalize(cross(axis, n));
  const bitangent = cross(n, tangent);
  const toWorld = (x: number, y: number, z: number): Point3 =>
    add(add(multiply(tangent, x), multiply(bitangent, y)), multiply(n, z));

  return { n, tangent, bitangent, toWorld };
}

// A fixed illustrative batch keeps each sample recognizable between steps.
const RANDOM_PAIRS = [
  [0.42, 0.08],
  [0.71, 0.46],
  [0.25, 0.79],
  [0.58, 0.22],
  [0.36, 0.62],
  [0.81, 0.95],
  [0.18, 0.35],
  [0.63, 0.73],
] as const;

export const HEMISPHERE_SAMPLES = RANDOM_PAIRS.map(([jitter, u2], index) => {
  const u1 = (index + jitter) / 8;
  const radius = Math.sqrt(u1);
  const phi = 2 * Math.PI * u2;

  return {
    index,
    u1,
    u2,
    radius,
    phi,
    x: radius * Math.cos(phi),
    y: radius * Math.sin(phi),
    z: Math.sqrt(1 - u1),
  };
});

export type SamplingState = {
  step: number;
  frame: number;
  disk: number;
  lift: number;
  tilt: number;
};

const state = (step: number): SamplingState => ({
  step,
  frame: step >= 1 ? 1 : 0,
  disk: step >= 2 ? 1 : 0,
  lift: step >= 3 ? 1 : 0,
  tilt: step >= 4 ? Math.PI / 6 : 0,
});

export const SAMPLING_STEPS: readonly [
  DiagramStep<SamplingState>,
  ...DiagramStep<SamplingState>[],
] = [
  {
    title: 'Start with the surface normal',
    description:
      'Normalize the normal. It defines the outward-facing side of the surface and the center of our hemisphere.',
    state: state(0),
  },
  {
    title: 'Build a local frame',
    description:
      'The tangent and bitangent span the surface. Together with the normal, they give us three perpendicular unit axes.',
    state: state(1),
  },
  {
    title: 'Sample eight points on a disk',
    description:
      'Choose one u1 sample in each of eight intervals and a second value u2 for rotation. Map each pair onto the disk using radius = sqrt(u1) and angle = 2πu2. Equal intervals of u1 correspond to equal disk areas, not equal angles.',
    state: state(2),
  },
  {
    title: 'Lift onto the hemisphere',
    description:
      'Keep the disk coordinates and add sqrt(1 − u1) along the normal. Each endpoint now gives a unit ray direction.',
    state: state(3),
  },
  {
    title: 'Orient the rays around the surface',
    description:
      'Combine the local components with the tangent, bitangent, and normal. The cosine-weighted distribution follows the surface, favoring directions near its normal.',
    state: state(4),
  },
];
