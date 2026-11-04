export type Point2 = readonly [number, number];
export type Point3 = readonly [number, number, number];

export interface Viewport {
  width: number;
  height: number;
}

export interface Camera {
  azimuth: number;
  elevation: number;
  zoom: number;
  target: Point3;
  span: Point2;
}

export interface Box3 {
  min: Point3;
  max: Point3;
}

export const add = (a: Point3, b: Point3): Point3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const subtract = (a: Point3, b: Point3): Point3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const multiply = (point: Point3, scale: number): Point3 => [
  point[0] * scale,
  point[1] * scale,
  point[2] * scale,
];
export const dot = (a: Point3, b: Point3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Point3, b: Point3): Point3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const mix = (a: Point3, b: Point3, progress: number) =>
  add(a, multiply(subtract(b, a), progress));

/** Orthographic projection: geometry stays in world space; text stays in pixels. */
export function createProjection(viewport: Viewport, camera: Camera) {
  const azimuth = (camera.azimuth * Math.PI) / 180;
  const elevation = (camera.elevation * Math.PI) / 180;
  const eye: Point3 = [
    Math.cos(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.sin(azimuth) * Math.cos(elevation),
  ];
  const right: Point3 = [Math.sin(azimuth), 0, -Math.cos(azimuth)];
  const up = cross(eye, right);
  const scale =
    Math.max(
      0,
      Math.min(
        (viewport.width - 36) / camera.span[0],
        (viewport.height - 55) / camera.span[1]
      )
    ) * camera.zoom;

  const project = (point: Point3): Point2 => {
    const relative = subtract(point, camera.target);
    return [
      viewport.width * 0.5 + dot(relative, right) * scale,
      viewport.height * 0.54 - dot(relative, up) * scale,
    ];
  };

  const path = (points: readonly Point3[], closed = false) =>
    points
      .map((point, index) => {
        const [x, y] = project(point);
        // Trigonometric results can differ in their last bits across JS engines.
        // Serialize subpixel precision consistently for server/client hydration.
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`;
      })
      .join(' ') + (closed ? ' Z' : '');

  // Shared edges get one opaque stroke, avoiding doubled brightness.
  const outline = (faces: readonly (readonly Point3[])[]) => {
    const edges = new Map<string, readonly [Point3, Point3]>();

    for (const face of faces) {
      face.forEach((start, index) => {
        const end = face[(index + 1) % face.length];
        const key = [start.join(','), end.join(',')].sort().join('|');
        edges.set(key, [start, end]);
      });
    }

    return [...edges.values()].map((edge) => path(edge)).join(' ');
  };

  const label = (
    point: Point3,
    text: string,
    offset: Point2,
    centered = false
  ) => {
    const [x, y] = project(point);
    const estimatedWidth = text.length * 7.2;
    const left = centered ? estimatedWidth / 2 : 0;
    const right = centered ? estimatedWidth / 2 : estimatedWidth;

    return {
      x: Math.max(
        10 + left,
        Math.min(viewport.width - 10 - right, x + offset[0])
      ),
      y: y + offset[1],
      textAnchor: centered ? ('middle' as const) : ('start' as const),
      dominantBaseline: 'middle' as const,
    };
  };

  return { eye, project, path, outline, label };
}

/** Visible solid faces, ordered back to front for SVG's painter's algorithm. */
export function visibleBoxFaces(box: Box3, eye: Point3): Point3[][] {
  const [x0, y0, z0] = box.min;
  const [x1, y1, z1] = box.max;
  const vertices: Point3[] = [
    [x0, y0, z0],
    [x1, y0, z0],
    [x1, y0, z1],
    [x0, y0, z1],
    [x0, y1, z0],
    [x1, y1, z0],
    [x1, y1, z1],
    [x0, y1, z1],
  ];
  const faces: { indices: number[]; normal: Point3 }[] = [
    { indices: [0, 3, 7, 4], normal: [-1, 0, 0] },
    { indices: [1, 5, 6, 2], normal: [1, 0, 0] },
    { indices: [0, 4, 5, 1], normal: [0, 0, -1] },
    { indices: [3, 2, 6, 7], normal: [0, 0, 1] },
    { indices: [4, 7, 6, 5], normal: [0, 1, 0] },
    { indices: [0, 1, 2, 3], normal: [0, -1, 0] },
  ];

  return faces
    .filter((face) => dot(face.normal, eye) > 0)
    .map((face) => face.indices.map((index) => vertices[index]))
    .sort((a, b) => dot(a[0], eye) - dot(b[0], eye));
}

export function intersectBox(origin: Point3, direction: Point3, box: Box3) {
  let entry = -Infinity;
  let exit = Infinity;

  for (let axis = 0; axis < 3; axis++) {
    if (Math.abs(direction[axis]) < 1e-9) {
      if (origin[axis] < box.min[axis] || origin[axis] > box.max[axis])
        return null;
      continue;
    }

    const near = (box.min[axis] - origin[axis]) / direction[axis];
    const far = (box.max[axis] - origin[axis]) / direction[axis];
    entry = Math.max(entry, Math.min(near, far));
    exit = Math.min(exit, Math.max(near, far));
    if (entry > exit) return null;
  }

  const distance = entry > 1e-5 ? entry : exit;
  if (!Number.isFinite(distance) || distance <= 1e-5) return null;

  return { distance, point: add(origin, multiply(direction, distance)) };
}

export function arc(center: Point3, radius: number, plane: 'xz' | 'xy' | 'yz') {
  return Array.from({ length: 49 }, (_, index) => {
    const angle = (index / 48) * Math.PI * (plane === 'xz' ? 2 : 1);
    const cosine = radius * Math.cos(angle);
    const sine = radius * Math.sin(angle);
    const offset: Point3 =
      plane === 'xz'
        ? [cosine, 0, sine]
        : plane === 'xy'
          ? [cosine, sine, 0]
          : [0, sine, cosine];
    return add(center, offset);
  });
}

/** Triangle apex is the endpoint; stop the shaft inside the triangle base. */
export function arrowPaths(start: Point2, end: Point2, showHead = true) {
  const distance = Math.hypot(end[0] - start[0], end[1] - start[1]);
  if (distance < 1e-6) return { shaft: '', head: '' };

  const ux = (end[0] - start[0]) / distance;
  const uy = (end[1] - start[1]) / distance;
  const length = Math.min(6, distance);
  const halfWidth = length / 2;
  const inset = showHead ? Math.max(0, length - 1) : 0;
  const [x, y] = end;

  return {
    shaft: `M ${start[0]} ${start[1]} L ${x - ux * inset} ${y - uy * inset}`,
    head: showHead
      ? `M ${x} ${y} L ${x - ux * length - uy * halfWidth} ${y - uy * length + ux * halfWidth} L ${x - ux * length + uy * halfWidth} ${y - uy * length - ux * halfWidth} Z`
      : '',
  };
}
