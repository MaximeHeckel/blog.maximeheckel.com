import { Box } from '@maximeheckel/design-system';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Slider } from '@core/components/Slider';

import { drawLeaderLabel, type CanvasPoint } from './canvasUtils';

type Vec2 = CanvasPoint;

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 420;
const ORIGIN: Vec2 = { x: 100, y: 200 };
const CIRCLE_CENTER: Vec2 = { x: 500, y: 200 };
const CIRCLE_RADIUS = 115;
const DIAGONAL_UNIT = Math.SQRT1_2;
const RAY_DRAW_LENGTH = 600;

const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s });
const dot = (a: Vec2, b: Vec2) => a.x * b.x + a.y * b.y;
const length = (v: Vec2) => Math.sqrt(dot(v, v));

const normalize = (v: Vec2): Vec2 => {
  const len = Math.max(length(v), 1e-6);
  return { x: v.x / len, y: v.y / len };
};

const rayCircleIntersection = (
  origin: Vec2,
  dir: Vec2,
  center: Vec2,
  radius: number
) => {
  const oc = sub(origin, center);
  const b = dot(oc, dir);
  const c = dot(oc, oc) - radius * radius;
  const discriminant = b * b - c;

  if (discriminant < 0.0) {
    return { discriminant, near: -1, far: -1, tValues: [] as number[] };
  }

  const sqrtD = Math.sqrt(discriminant);
  const near = -b - sqrtD;
  const far = -b + sqrtD;
  const tValues = [near, far].filter((t) => t >= 0).sort((x, y) => x - y);

  return { discriminant, near, far, tValues };
};

export const RaySphereIntersect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);
  const [rayAngle, setRayAngle] = useState(10.0);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setDpr(window.devicePixelRatio || 1);
    }
  }, []);

  const rayDir = useMemo(() => {
    const r = (rayAngle * Math.PI) / 180;
    return normalize({ x: Math.cos(r), y: -Math.sin(r) });
  }, [rayAngle]);
  const intersection = useMemo(
    () => rayCircleIntersection(ORIGIN, rayDir, CIRCLE_CENTER, CIRCLE_RADIUS),
    [rayDir]
  );
  const oc = useMemo(() => sub(ORIGIN, CIRCLE_CENTER), []);
  const halfB = useMemo(() => dot(oc, rayDir), [oc, rayDir]);
  const closestPoint = useMemo(
    () => add(ORIGIN, mul(rayDir, -halfB)),
    [halfB, rayDir]
  );
  const p1 =
    intersection.tValues[0] !== undefined
      ? add(ORIGIN, mul(rayDir, intersection.tValues[0]))
      : null;
  const p2 =
    intersection.tValues[1] !== undefined
      ? add(ORIGIN, mul(rayDir, intersection.tValues[1]))
      : null;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

    // Background
    ctx.fillStyle = 'oklch(98.23% 0.008 271.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

    // Circle ("sphere" in 2D)
    ctx.fillStyle = 'oklch(64.19% 0.174 264.7 / 0.2)';
    ctx.strokeStyle = 'oklch(64.19% 0.174 264.7)';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(
      CIRCLE_CENTER.x * dpr,
      CIRCLE_CENTER.y * dpr,
      CIRCLE_RADIUS * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // Segment oc from C to O (same variable as shader code).
    ctx.strokeStyle = 'oklch(0% 0 0 / 0.2)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([6 * dpr, 6 * dpr]);
    ctx.beginPath();
    ctx.moveTo(CIRCLE_CENTER.x * dpr, CIRCLE_CENTER.y * dpr);
    ctx.lineTo(ORIGIN.x * dpr, ORIGIN.y * dpr);
    ctx.stroke();
    ctx.setLineDash([]);

    // H is the projection of C onto the ray direction (encodes b = dot(oc, dir)).
    ctx.strokeStyle = 'oklch(0% 0 0 / 0.2)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([4 * dpr, 5 * dpr]);
    ctx.beginPath();
    ctx.moveTo(CIRCLE_CENTER.x * dpr, CIRCLE_CENTER.y * dpr);
    ctx.lineTo(closestPoint.x * dpr, closestPoint.y * dpr);
    ctx.stroke();
    ctx.setLineDash([]);

    // Circle center
    ctx.fillStyle = 'oklch(64.19% 0.174 264.7)';
    ctx.beginPath();
    ctx.arc(
      CIRCLE_CENTER.x * dpr,
      CIRCLE_CENTER.y * dpr,
      5 * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Circle center label
    ctx.fillStyle = 'oklch(0% 0 0)';
    ctx.font = `${13 * dpr}px DepartureMono, system-ui, sans-serif`;
    ctx.fillText(
      'C',
      (CIRCLE_CENTER.x - 12) * dpr,
      (CIRCLE_CENTER.y - 12) * dpr
    );

    // Ray
    const rayEnd = add(ORIGIN, mul(rayDir, RAY_DRAW_LENGTH));
    ctx.strokeStyle = 'oklch(82.61% 0.086 267.1)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(ORIGIN.x * dpr, ORIGIN.y * dpr);
    ctx.lineTo(rayEnd.x * dpr, rayEnd.y * dpr);
    ctx.stroke();

    if (p1 && p2) {
      ctx.strokeStyle = 'oklch(69.88% 0.201 43)';
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath();
      ctx.moveTo(p1.x * dpr, p1.y * dpr);
      ctx.lineTo(p2.x * dpr, p2.y * dpr);
      ctx.stroke();
    }

    // Closest point
    ctx.fillStyle = 'oklch(64.19% 0.174 264.7)';
    ctx.beginPath();
    ctx.arc(
      closestPoint.x * dpr,
      closestPoint.y * dpr,
      5 * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Origin
    ctx.fillStyle = 'oklch(82.61% 0.086 267.1)';
    ctx.beginPath();
    ctx.arc(ORIGIN.x * dpr, ORIGIN.y * dpr, 5 * dpr, 0, Math.PI * 2);
    ctx.fill();

    // Intersection points
    if (p1) {
      ctx.fillStyle = 'oklch(69.88% 0.201 43)';
      ctx.beginPath();
      ctx.arc(p1.x * dpr, p1.y * dpr, 5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p2) {
      ctx.fillStyle = 'oklch(69.88% 0.201 43)';
      ctx.beginPath();
      ctx.arc(p2.x * dpr, p2.y * dpr, 5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = 'oklch(0% 0 0)';
    ctx.font = `${13 * dpr}px DepartureMono, system-ui, sans-serif`;
    ctx.fillText('O', (ORIGIN.x - 12) * dpr, (ORIGIN.y - 12) * dpr);
    ctx.fillText('H', (closestPoint.x + 8) * dpr, (closestPoint.y - 10) * dpr);
    if (p1) {
      ctx.fillText('p1', (p1.x - 20) * dpr, (p1.y - 12) * dpr);
    }
    if (p2) {
      ctx.fillText('p2', (p2.x + 8) * dpr, (p2.y - 12) * dpr);
    }

    const alignedLabelX = CIRCLE_CENTER.x + CIRCLE_RADIUS + 24;

    drawLeaderLabel(
      ctx,
      dpr,
      'Atmosphere',
      {
        x: alignedLabelX,
        y: CIRCLE_CENTER.y + ATMOSPHERE_RADIUS + 24,
      },
      {
        x: CIRCLE_CENTER.x + ATMOSPHERE_RADIUS * DIAGONAL_UNIT * 1.05,
        y: CIRCLE_CENTER.y + ATMOSPHERE_RADIUS * DIAGONAL_UNIT * 1.05,
      }
    );
  }, [closestPoint, dpr, p1, p2, rayDir]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <>
      <Box
        css={{
          borderRadius: 'var(--border-radius-2)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          display: 'flex',
          backgroundColor: 'oklch(98.23% 0.008 271.3)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH * dpr}
          height={CANVAS_HEIGHT * dpr}
          style={{
            width: '100%',
            height: 'auto',
            cursor: 'default',
          }}
        />
      </Box>
      <Slider
        id="ray-angle"
        label="Ray Angle"
        min={-30}
        max={30}
        step={0.1}
        value={rayAngle}
        labelValue={`${rayAngle.toFixed(1)}°`}
        onChange={setRayAngle}
      />
    </>
  );
};

const ATMOSPHERE_RADIUS = 115;
const PLANET_RADIUS = 82;

export const RaySphereIntersectPlanet = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);
  const [rayAngle, setRayAngle] = useState(10.0);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setDpr(window.devicePixelRatio || 1);
    }
  }, []);

  const rayDir = useMemo(() => {
    const r = (rayAngle * Math.PI) / 180;
    return normalize({ x: Math.cos(r), y: -Math.sin(r) });
  }, [rayAngle]);
  const atmosphereHit = useMemo(
    () =>
      rayCircleIntersection(ORIGIN, rayDir, CIRCLE_CENTER, ATMOSPHERE_RADIUS),
    [rayDir]
  );
  const planetHit = useMemo(
    () => rayCircleIntersection(ORIGIN, rayDir, CIRCLE_CENTER, PLANET_RADIUS),
    [rayDir]
  );
  const oc = useMemo(() => sub(ORIGIN, CIRCLE_CENTER), []);
  const halfB = useMemo(() => dot(oc, rayDir), [oc, rayDir]);
  const closestPoint = useMemo(
    () => add(ORIGIN, mul(rayDir, -halfB)),
    [halfB, rayDir]
  );
  const p1 =
    atmosphereHit.tValues[0] !== undefined
      ? add(ORIGIN, mul(rayDir, atmosphereHit.tValues[0]))
      : null;
  const p2 =
    atmosphereHit.tValues[1] !== undefined
      ? add(ORIGIN, mul(rayDir, atmosphereHit.tValues[1]))
      : null;
  const g1 =
    planetHit.tValues[0] !== undefined
      ? add(ORIGIN, mul(rayDir, planetHit.tValues[0]))
      : null;
  const g2 =
    planetHit.tValues[1] !== undefined
      ? add(ORIGIN, mul(rayDir, planetHit.tValues[1]))
      : null;
  const clippedSegment = useMemo(() => {
    const sceneDepth = RAY_DRAW_LENGTH;
    const hasAtmosphereHit = atmosphereHit.near > 0 || atmosphereHit.far > 0;
    if (!hasAtmosphereHit) {
      return null;
    }

    const atmosphereNear = Math.max(atmosphereHit.near, 0);
    let atmosphereFar = atmosphereHit.far;

    if (planetHit.near > 0) {
      atmosphereFar = Math.min(atmosphereFar, planetHit.near);
      if (sceneDepth < planetHit.near - 2.0) {
        atmosphereFar = Math.min(atmosphereFar, sceneDepth);
      }
    } else {
      atmosphereFar = Math.min(atmosphereFar, sceneDepth);
    }

    if (atmosphereFar <= atmosphereNear) {
      return null;
    }

    return {
      near: atmosphereNear,
      far: atmosphereFar,
      nearPoint: add(ORIGIN, mul(rayDir, atmosphereNear)),
      farPoint: add(ORIGIN, mul(rayDir, atmosphereFar)),
    };
  }, [atmosphereHit.far, atmosphereHit.near, planetHit.near, rayDir]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

    // Background
    ctx.fillStyle = 'oklch(98.23% 0.008 271.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

    // Atmosphere shell ("sphere" in 2D)
    ctx.fillStyle = 'oklch(64.19% 0.174 264.7 / 0.2)';
    ctx.strokeStyle = 'oklch(64.19% 0.174 264.7)';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(
      CIRCLE_CENTER.x * dpr,
      CIRCLE_CENTER.y * dpr,
      ATMOSPHERE_RADIUS * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // Planet ground inside the atmosphere.
    ctx.fillStyle = 'oklch(70% 0 0 / 0.25)';
    ctx.strokeStyle = 'oklch(70% 0 0)';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(
      CIRCLE_CENTER.x * dpr,
      CIRCLE_CENTER.y * dpr,
      PLANET_RADIUS * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();

    // Segment oc from C to O (same variable as shader code).
    ctx.strokeStyle = 'oklch(0% 0 0 / 0.2)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([6 * dpr, 6 * dpr]);
    ctx.beginPath();
    ctx.moveTo(CIRCLE_CENTER.x * dpr, CIRCLE_CENTER.y * dpr);
    ctx.lineTo(ORIGIN.x * dpr, ORIGIN.y * dpr);
    ctx.stroke();
    ctx.setLineDash([]);

    // H is the projection of C onto the ray direction (encodes b = dot(oc, dir)).
    ctx.strokeStyle = 'oklch(0% 0 0 / 0.2)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([4 * dpr, 5 * dpr]);
    ctx.beginPath();
    ctx.moveTo(CIRCLE_CENTER.x * dpr, CIRCLE_CENTER.y * dpr);
    ctx.lineTo(closestPoint.x * dpr, closestPoint.y * dpr);
    ctx.stroke();
    ctx.setLineDash([]);

    // Circle center
    ctx.fillStyle = 'oklch(64.19% 0.174 264.7)';
    ctx.beginPath();
    ctx.arc(
      CIRCLE_CENTER.x * dpr,
      CIRCLE_CENTER.y * dpr,
      5 * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Circle center label
    ctx.fillStyle = 'oklch(0% 0 0)';
    ctx.font = `${13 * dpr}px DepartureMono, system-ui, sans-serif`;
    ctx.fillText(
      'C',
      (CIRCLE_CENTER.x - 12) * dpr,
      (CIRCLE_CENTER.y - 12) * dpr
    );

    // Ray
    const rayEnd = add(ORIGIN, mul(rayDir, RAY_DRAW_LENGTH));
    ctx.strokeStyle = 'oklch(82.61% 0.086 267.1)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(ORIGIN.x * dpr, ORIGIN.y * dpr);
    ctx.lineTo(rayEnd.x * dpr, rayEnd.y * dpr);
    ctx.stroke();

    if (clippedSegment) {
      ctx.strokeStyle = 'oklch(69.88% 0.201 43)';
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath();
      ctx.moveTo(
        clippedSegment.nearPoint.x * dpr,
        clippedSegment.nearPoint.y * dpr
      );
      ctx.lineTo(
        clippedSegment.farPoint.x * dpr,
        clippedSegment.farPoint.y * dpr
      );
      ctx.stroke();
    }

    // Closest point
    ctx.fillStyle = 'oklch(64.19% 0.174 264.7)';
    ctx.beginPath();
    ctx.arc(
      closestPoint.x * dpr,
      closestPoint.y * dpr,
      5 * dpr,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Origin
    ctx.fillStyle = 'oklch(82.61% 0.086 267.1)';
    ctx.beginPath();
    ctx.arc(ORIGIN.x * dpr, ORIGIN.y * dpr, 5 * dpr, 0, Math.PI * 2);
    ctx.fill();

    // Intersection points
    if (p1) {
      ctx.fillStyle = 'oklch(69.88% 0.201 43)';
      ctx.beginPath();
      ctx.arc(p1.x * dpr, p1.y * dpr, 5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p2) {
      ctx.fillStyle = 'oklch(69.88% 0.201 43)';
      ctx.beginPath();
      ctx.arc(p2.x * dpr, p2.y * dpr, 5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    if (g1) {
      ctx.fillStyle = 'oklch(75% 0 0)';
      ctx.beginPath();
      ctx.arc(g1.x * dpr, g1.y * dpr, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    if (g2) {
      ctx.fillStyle = 'oklch(75% 0 0)';
      ctx.beginPath();
      ctx.arc(g2.x * dpr, g2.y * dpr, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    if (clippedSegment) {
      ctx.fillStyle = 'oklch(69.88% 0.201 43)';
      ctx.beginPath();
      ctx.arc(
        clippedSegment.farPoint.x * dpr,
        clippedSegment.farPoint.y * dpr,
        5 * dpr,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = 'oklch(0% 0 0)';
    ctx.font = `${13 * dpr}px DepartureMono, system-ui, sans-serif`;
    ctx.fillText('O', (ORIGIN.x - 12) * dpr, (ORIGIN.y - 12) * dpr);
    ctx.fillText('H', (closestPoint.x + 8) * dpr, (closestPoint.y - 10) * dpr);
    if (p1) {
      ctx.fillText('p1', (p1.x - 20) * dpr, (p1.y - 12) * dpr);
    }
    if (p2) {
      ctx.fillText('p2', (p2.x + 8) * dpr, (p2.y - 12) * dpr);
    }
    if (g1) {
      ctx.fillText('g1', (g1.x - 20) * dpr, (g1.y + 18) * dpr);
    }
    if (g2) {
      ctx.fillText('g2', (g2.x + 8) * dpr, (g2.y + 18) * dpr);
    }

    const alignedLabelX = CIRCLE_CENTER.x + ATMOSPHERE_RADIUS + 24;

    drawLeaderLabel(
      ctx,
      dpr,
      'Atmosphere',
      {
        x: alignedLabelX,
        y: CIRCLE_CENTER.y + ATMOSPHERE_RADIUS + 24,
      },
      {
        x: CIRCLE_CENTER.x + ATMOSPHERE_RADIUS * DIAGONAL_UNIT * 1.05,
        y: CIRCLE_CENTER.y + ATMOSPHERE_RADIUS * DIAGONAL_UNIT * 1.05,
      }
    );
    drawLeaderLabel(
      ctx,
      dpr,
      'Planet',
      {
        x: alignedLabelX,
        y: CIRCLE_CENTER.y,
      },
      {
        x: CIRCLE_CENTER.x + PLANET_RADIUS * 1.05,
        y: CIRCLE_CENTER.y,
      }
    );
  }, [clippedSegment, closestPoint, dpr, g1, g2, p1, p2, rayDir]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <>
      <Box
        css={{
          borderRadius: 'var(--border-radius-2)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          display: 'flex',
          backgroundColor: 'oklch(98.23% 0.008 271.3)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH * dpr}
          height={CANVAS_HEIGHT * dpr}
          style={{
            width: '100%',
            height: 'auto',
            cursor: 'default',
          }}
        />
      </Box>
      <Slider
        id="ray-angle"
        label="Ray Angle"
        min={-30}
        max={30}
        step={0.1}
        value={rayAngle}
        labelValue={`${rayAngle.toFixed(1)}°`}
        onChange={setRayAngle}
      />
    </>
  );
};
