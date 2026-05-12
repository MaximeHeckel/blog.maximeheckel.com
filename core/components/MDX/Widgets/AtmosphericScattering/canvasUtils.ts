export type CanvasPoint = { x: number; y: number };

export interface ScatteringSample {
  position: CanvasPoint;
  density: number;
  lightSamples: CanvasPoint[];
}

export interface DrawLeaderLabelOptions {
  flipLabel?: boolean;
}

const add = (a: CanvasPoint, b: CanvasPoint): CanvasPoint => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

const sub = (a: CanvasPoint, b: CanvasPoint): CanvasPoint => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

const mul = (v: CanvasPoint, s: number): CanvasPoint => ({
  x: v.x * s,
  y: v.y * s,
});

const dot = (a: CanvasPoint, b: CanvasPoint) => a.x * b.x + a.y * b.y;
const length = (v: CanvasPoint) => Math.sqrt(dot(v, v));

const normalize = (v: CanvasPoint): CanvasPoint => {
  const len = Math.max(length(v), 1e-6);
  return { x: v.x / len, y: v.y / len };
};

export const drawArrowHead = (
  ctx: CanvasRenderingContext2D,
  dpr: number,
  from: CanvasPoint,
  to: CanvasPoint
) => {
  const toPx = mul(to, dpr);
  const dir = normalize(sub(to, from));
  const arrowLength = 6 * dpr;
  const arrowWidth = 4 * dpr;
  const ux = dir.x;
  const uy = dir.y;
  const px = -uy;
  const py = ux;

  ctx.beginPath();
  ctx.moveTo(toPx.x, toPx.y);
  ctx.lineTo(
    toPx.x - ux * arrowLength + px * arrowWidth,
    toPx.y - uy * arrowLength + py * arrowWidth
  );
  ctx.lineTo(
    toPx.x - ux * arrowLength - px * arrowWidth,
    toPx.y - uy * arrowLength - py * arrowWidth
  );
  ctx.closePath();
  ctx.fill();
};

export const drawLeaderLabel = (
  ctx: CanvasRenderingContext2D,
  dpr: number,
  label: string,
  from: CanvasPoint,
  to: CanvasPoint,
  options: DrawLeaderLabelOptions = {}
) => {
  const fromPx = mul(from, dpr);
  const actualTo = add(
    to,
    options.flipLabel ? { x: -5, y: -5 } : { x: 5, y: -5 }
  );
  const toPx = mul(actualTo, dpr);

  ctx.save();
  ctx.strokeStyle = 'oklch(0% 0 0)';
  ctx.fillStyle = 'oklch(0% 0 0)';
  ctx.lineWidth = 1.25 * dpr;
  ctx.beginPath();
  ctx.moveTo(fromPx.x, fromPx.y);
  ctx.lineTo(toPx.x, toPx.y);
  ctx.stroke();

  drawArrowHead(ctx, dpr, from, actualTo);

  ctx.font = `${13 * dpr}px DepartureMono, system-ui, sans-serif`;
  const labelOffset = 4 * dpr;
  const labelX = options.flipLabel
    ? fromPx.x - ctx.measureText(label).width - labelOffset
    : fromPx.x + labelOffset;

  ctx.fillText(label, labelX, fromPx.y + 5);
  ctx.restore();
};
