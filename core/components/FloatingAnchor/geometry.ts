export type WindowCorner =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export interface Point {
  x: number;
  y: number;
}
export interface Viewport {
  width: number;
  height: number;
}

export const WIDTH = 48;
export const HEIGHT = 40;
const INSET = 8;
export const ATTACH_DISTANCE = 44;
const GLUE_DISTANCE = 24;
const r = HEIGHT / 2;
export const CAPSULE_PATH = `M ${r} 0 H ${WIDTH - r} A ${r} ${r} 0 0 1 ${WIDTH - r} ${HEIGHT} H ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;

export const clampPoint = (point: Point, viewport: Viewport): Point => ({
  x: Math.max(INSET, Math.min(point.x, viewport.width - WIDTH - INSET)),
  y: Math.max(INSET, Math.min(point.y, viewport.height - HEIGHT - INSET)),
});

export const nearestEdge = (point: Point, viewport: Viewport) => {
  const edges = [
    { side: 'left', distance: point.x },
    { side: 'right', distance: viewport.width - point.x - WIDTH },
    { side: 'top', distance: point.y },
    { side: 'bottom', distance: viewport.height - point.y - HEIGHT },
  ] as const;
  return edges.reduce((nearest, edge) =>
    edge.distance < nearest.distance ? edge : nearest
  );
};

export const settlePoint = (point: Point, viewport: Viewport): Point => {
  const clamped = clampPoint(point, viewport);
  const edge = nearestEdge(clamped, viewport);
  if (edge.distance > ATTACH_DISTANCE) return clamped;
  if (edge.side === 'left') return { ...clamped, x: 0 };
  if (edge.side === 'right') return { ...clamped, x: viewport.width - WIDTH };
  if (edge.side === 'top') return { ...clamped, y: 0 };
  return { ...clamped, y: viewport.height - HEIGHT };
};

// Pull into the edge continuously, reaching full attachment before release.
// The caller keeps the unsnapped pointer origin so pulling away stays natural.
export const dragPoint = (point: Point, viewport: Viewport): Point => {
  const clamped = clampPoint(point, viewport);
  const edge = nearestEdge(clamped, viewport);
  if (edge.distance >= ATTACH_DISTANCE) return clamped;
  const progress = Math.min(
    1,
    (ATTACH_DISTANCE - edge.distance) / (ATTACH_DISTANCE - 12)
  );
  const attraction = progress * progress * (3 - 2 * progress);
  const target = settlePoint(clamped, viewport);
  return {
    x: clamped.x + (target.x - clamped.x) * attraction,
    y: clamped.y + (target.y - clamped.y) * attraction,
  };
};

export const cornerForPoint = (
  point: Point,
  viewport: Viewport
): WindowCorner =>
  `${point.y + HEIGHT / 2 < viewport.height / 2 ? 'top' : 'bottom'}-${point.x + WIDTH / 2 < viewport.width / 2 ? 'left' : 'right'}`;

// One continuous silhouette: a floating capsule becomes a compact, flush tab.
export const anchorShape = (point: Point, viewport: Viewport) => {
  const edge = nearestEdge(point, viewport);
  const d = Math.max(0, edge.distance);
  if (d >= GLUE_DISTANCE) {
    return {
      path: CAPSULE_PATH,
      attachmentOpacity: 0,
      iconX: 0,
      iconY: 0,
    };
  }
  const strength = Math.max(0, 1 - d / GLUE_DISTANCE);
  // Dissolve the weak connection before it becomes a hairline. Smoothstep
  // keeps both ends continuous when reversing direction during a drag.
  const connection = Math.min(1, (GLUE_DISTANCE - d) / 16);
  const attachmentOpacity = connection * connection * (3 - 2 * connection);
  const approach = Math.max(0, 1 - d / 24);
  const dock = approach * approach * (3 - 2 * approach);
  const horizontal = edge.side === 'left' || edge.side === 'right';
  const length = horizontal ? WIDTH : HEIGHT;
  const breadth = horizontal ? HEIGHT : WIDTH;
  const back = (length - 40) * dock;
  const top = ((breadth - 40) / 2) * dock;
  const bottom = breadth - top;
  const middle = breadth / 2;
  const radius = 20 - 8 * dock;
  const half = middle - top;
  // Follow the rounded shoulder into a thin waist, then flare onto the wall.
  // Both sides of each join share a tangent, avoiding a pinched or angular seam.
  const angle = 0.9 * Math.sqrt(strength) * (1 - dock) + (Math.PI / 2) * dock;
  const join = length - radius + radius * Math.cos(angle);
  const shoulder = half * Math.sin(angle);
  const neck = strength * (2 + 4 * strength) * (1 - dock) + half * dock;
  const flare = strength * (half + 10);
  const edgeX = length + (strength > 0 ? d : 0);
  const waistX = join + (edgeX - join) * 0.48;
  const handle = Math.min(radius * 0.55, (waistX - join) * 0.65);
  const tangentX = Math.sin(angle) * handle;
  const tangentY = Math.cos(angle) * handle;
  const shoulderStart = Math.min(length - radius, join - tangentX);
  const shoulderControl = shoulderStart + (join - shoulderStart) * 0.55;
  const waistHandle = (edgeX - join) * 0.18;
  const p = (along: number, across: number) => {
    if (edge.side === 'right') return `${along} ${across}`;
    if (edge.side === 'left') return `${WIDTH - along} ${HEIGHT - across}`;
    if (edge.side === 'bottom') return `${WIDTH - across} ${along}`;
    return `${across} ${HEIGHT - along}`;
  };
  const upper = middle - neck;
  const lower = middle + neck;
  const path = `M ${p(back + radius, top)}
    L ${p(shoulderStart, top)}
    C ${p(shoulderControl, top)} ${p(join - tangentX, middle - shoulder - tangentY)} ${p(join, middle - shoulder)}
    C ${p(join + tangentX, middle - shoulder + tangentY)} ${p(waistX - waistHandle, upper)} ${p(waistX, upper)}
    C ${p(waistX + waistHandle, upper)} ${p(edgeX, upper)} ${p(edgeX, middle - flare)}
    L ${p(edgeX, middle + flare)}
    C ${p(edgeX, lower)} ${p(waistX + waistHandle, lower)} ${p(waistX, lower)}
    C ${p(waistX - waistHandle, lower)} ${p(join + tangentX, middle + shoulder - tangentY)} ${p(join, middle + shoulder)}
    C ${p(join - tangentX, middle + shoulder + tangentY)} ${p(shoulderControl, bottom)} ${p(shoulderStart, bottom)}
    L ${p(back + radius, bottom)}
    Q ${p(back, bottom)} ${p(back, bottom - radius)}
    L ${p(back, top + radius)}
    Q ${p(back, top)} ${p(back + radius, top)} Z`;
  return {
    path,
    attachmentOpacity,
    iconX: horizontal
      ? (back / 2) * (edge.side === 'right' ? 1 : -1) * attachmentOpacity
      : 0,
    iconY: 0,
  };
};
