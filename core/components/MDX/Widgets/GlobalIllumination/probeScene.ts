import type { DiagramStep } from './Diagram';
import { Point3, add, intersectBox, multiply, subtract } from './geometry';
import { CAMERA, CUBE, SLAB, SURFACE_POINT } from './raymarchingScene';

const spacing = 1.2;
const spline = (distance: number) => {
  const d = Math.abs(distance);
  return d < 0.5 ? 0.75 - d * d : d < 1.5 ? 0.5 * (1.5 - d) ** 2 : 0;
};

// A sparse, representative part of the grid. The renderer visits up to 27
// neighbors; this drawing shows only a handful of connections for readability.
// Uniform spacing on every axis keeps the probe cells cubic.
const gridX = Array.from(
  { length: 6 },
  (_, index) => (SLAB.min[0] + SLAB.max[0]) / 2 + (index - 2.5) * spacing
);
const gridZ = Array.from(
  { length: 5 },
  (_, index) => (SLAB.min[2] + SLAB.max[2]) / 2 + (index - 2) * spacing
);
const layerSize = gridX.length * gridZ.length;

export const PROBES = Array.from({ length: layerSize * 2 }, (_, id) => {
  const position: Point3 = [
    gridX[id % gridX.length],
    SLAB.max[1] + 0.18 + Math.floor(id / layerSize) * spacing,
    gridZ[Math.floor(id / gridX.length) % gridZ.length],
  ];
  const inside = position.every(
    (value, axis) => value > CUBE.min[axis] && value < CUBE.max[axis]
  );
  const origin = add(SURFACE_POINT, [0, 0.005, 0]);
  const delta = subtract(position, origin);
  const distance = Math.hypot(...delta);
  const hit = intersectBox(origin, multiply(delta, 1 / distance), CUBE);
  const blocked = hit !== null && hit.distance < distance - 0.01;
  const weight = delta.reduce((value, d) => value * spline(d / spacing), 1);

  return { id, position, inside, blocked, hit, weight };
});

// Connect adjacent grid positions along the three world axes.
export const PROBE_GRID_EDGES = PROBES.flatMap((probe) =>
  [
    probe.id % gridX.length < gridX.length - 1
      ? PROBES[probe.id + 1]
      : undefined,
    Math.floor(probe.id / gridX.length) % gridZ.length < gridZ.length - 1
      ? PROBES[probe.id + gridX.length]
      : undefined,
    probe.id < layerSize ? PROBES[probe.id + layerSize] : undefined,
  ].flatMap((neighbor) => {
    if (!neighbor || probe.inside || neighbor.inside) return [];

    const delta = subtract(neighbor.position, probe.position);
    const distance = Math.hypot(...delta);
    const hit = intersectBox(
      probe.position,
      multiply(delta, 1 / distance),
      CUBE
    );
    if (hit && hit.distance < distance) return [];

    return [{ from: probe, to: neighbor }];
  })
);

export const SELECTED_PROBE = PROBES[14];
export const NEIGHBORS = PROBES.filter((probe) =>
  [8, 14, 20, 44, 46].includes(probe.id)
);
const totalWeight = NEIGHBORS.reduce(
  (sum, probe) => sum + (probe.blocked ? 0 : probe.weight),
  0
);
export const probeWeight = (id: number) => {
  const probe = PROBES[id];
  return probe.blocked ? 0 : probe.weight / totalWeight;
};

// Orient the representative samples toward each of the six world axes.
export const SAMPLE_AXES = ['+X', '+Y', '+Z', '−X', '−Y', '−Z'] as const;
export const orientSample = ([x, y, z]: Point3, axis: number): Point3 => {
  const normal = axis < 3 ? y : -y;
  return axis % 3 === 0
    ? [normal, x, z]
    : axis % 3 === 1
      ? [x, normal, z]
      : [x, z, normal];
};

// Show a planar slice of each hemisphere so intersections remain legible in 2D.
// Real probes sample the full hemisphere, including out-of-plane directions.
const sampleAngles = [-50, -15, 25, 65];

export const PROBE_RAYS = SAMPLE_AXES.map((_, axis) =>
  sampleAngles.map((degrees) => {
    const angle = (degrees * Math.PI) / 180;
    const tangent = Math.sin(angle);
    const normal = Math.cos(angle);
    const sample: Point3 = [tangent, normal, 0];
    const direction = orientSample(sample, axis);
    const cubeHit = intersectBox(SELECTED_PROBE.position, direction, CUBE);
    const slabHit = intersectBox(SELECTED_PROBE.position, direction, SLAB);
    const hit =
      cubeHit && slabHit
        ? cubeHit.distance < slabHit.distance
          ? cubeHit
          : slabHit
        : (cubeHit ?? slabHit);
    return {
      hit,
      tip:
        hit?.point ?? add(SELECTED_PROBE.position, multiply(direction, 1.65)),
    };
  })
);

const INITIAL = {
  cameraAzimuth: CAMERA.azimuth,
  cameraElevation: CAMERA.elevation,
  cameraZoom: 1,
  cameraTargetX: CAMERA.target[0],
  cameraTargetY: CAMERA.target[1],
  cameraTargetZ: CAMERA.target[2],
  overview: 1,
  gather: 0,
  sampleX: 0,
  sampleY: 0,
  sampleZ: 0,
  sampleNegativeX: 0,
  sampleNegativeY: 0,
  sampleNegativeZ: 0,
  lookup: 0,
  rejected: 0,
  blend: 0,
  shade: 0,
  pixel: 0,
  pixelEmphasis: 0,
};
export type ProbeState = typeof INITIAL;

const CLOSE_UP = {
  cameraElevation: 25,
  cameraZoom: 1.65,
  cameraTargetX: SELECTED_PROBE.position[0],
  cameraTargetY: SELECTED_PROBE.position[1] + 0.15,
  cameraTargetZ: SELECTED_PROBE.position[2],
};

export const PROBE_STEPS: readonly [
  DiagramStep<ProbeState>,
  ...DiagramStep<ProbeState>[],
] = [
  {
    title: 'Start with the scene',
    description:
      'Gather lighting throughout the scene with world-space probes, then query their estimates when shading a surface pixel.',
    state: { ...INITIAL, overview: 0 },
  },
  {
    title: 'Place probes in the scene',
    description:
      'Fixed world-space probes store lighting measurements. This sparse grid represents part of the full probe volume.',
    state: INITIAL,
  },
  {
    title: 'Gather light from +X',
    description:
      'View the positive X hemisphere side-on. Average sampled incoming light to store the positive X directional estimate.',
    state: {
      ...INITIAL,
      ...CLOSE_UP,
      cameraAzimuth: 270,
      cameraElevation: 0,
      overview: 0,
      gather: 1,
      sampleX: 1,
    },
  },
  {
    title: 'Gather light from +Y',
    description:
      'Rotate to a side-on view of the upward hemisphere. These samples produce the positive Y directional estimate.',
    state: {
      ...INITIAL,
      ...CLOSE_UP,
      cameraAzimuth: 270,
      cameraElevation: 0,
      overview: 0,
      gather: 1,
      sampleY: 1,
    },
  },
  {
    title: 'Gather light from +Z',
    description:
      'View the positive Z hemisphere side-on. Average sampled incoming light to store the positive Z directional estimate.',
    state: {
      ...INITIAL,
      ...CLOSE_UP,
      cameraAzimuth: 180,
      cameraElevation: 90,
      overview: 0,
      gather: 1,
      sampleZ: 1,
    },
  },
  {
    title: 'Gather light from −X',
    description:
      'Sample the negative X hemisphere and average incoming light into its directional estimate. Surface hits include the cube and the slab.',
    state: {
      ...INITIAL,
      ...CLOSE_UP,
      cameraAzimuth: 270,
      cameraElevation: 0,
      overview: 0,
      gather: 1,
      sampleNegativeX: 1,
    },
  },
  {
    title: 'Gather light from −Y',
    description:
      'Sample the negative Y hemisphere and average incoming light into its directional estimate. Surface hits include the cube and the slab.',
    state: {
      ...INITIAL,
      ...CLOSE_UP,
      cameraAzimuth: 270,
      cameraElevation: 0,
      overview: 0,
      gather: 1,
      sampleNegativeY: 1,
    },
  },
  {
    title: 'Gather light from −Z',
    description:
      'Sample the negative Z hemisphere and average incoming light into its directional estimate. Surface hits include the cube and the slab.',
    state: {
      ...INITIAL,
      ...CLOSE_UP,
      cameraAzimuth: 180,
      cameraElevation: 90,
      overview: 0,
      gather: 1,
      sampleNegativeZ: 1,
    },
  },
  {
    title: 'Find usable neighboring probes',
    description:
      'For a surface pixel, check nearby probes. A connection blocked by the cube cannot contribute. The implementation considers up to 27 neighbors; only a few are drawn here.',
    state: { ...INITIAL, overview: 0, lookup: 1, rejected: 1, pixel: 1 },
  },
  {
    title: 'Blend their estimates',
    description:
      'The floor uses each probe’s upward-facing lobe. Blend visible neighbors with spatial B-spline weights, normalized after rejecting blocked probes. Connections represent data lookups.',
    state: {
      ...INITIAL,
      overview: 0,
      cameraZoom: 1.45,
      cameraTargetX: -0.8,
      cameraTargetY: 0.55,
      cameraTargetZ: 0.1,
      lookup: 1,
      blend: 1,
      pixel: 1,
    },
  },
  {
    title: 'Apply indirect light',
    description:
      'Multiply the blended diffuse lighting estimate by the receiving surface’s albedo. Nearby pixels can reuse the same probes. The blue fill illustrates the contribution; it is not a radiance calculation.',
    state: { ...INITIAL, overview: 0, shade: 1, pixel: 1, pixelEmphasis: 1 },
  },
];
