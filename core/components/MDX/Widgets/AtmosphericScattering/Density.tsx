import { Box, Flex } from '@maximeheckel/design-system';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Slider } from '@core/components/Slider';

import {
  drawLeaderLabel,
  type CanvasPoint,
  type ScatteringSample,
} from './canvasUtils';

type Vec2 = CanvasPoint;

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 220;
const MEDIUM_LEFT = 0;
const MEDIUM_WIDTH = 760;
const PIXEL_SIZE = 64;
const PIXEL_RADIUS = 6;
const RAY_START: Vec2 = { x: MEDIUM_LEFT + 60, y: CANVAS_HEIGHT / 2 };
const RAY_END: Vec2 = {
  x: MEDIUM_LEFT + MEDIUM_WIDTH - 70,
  y: CANVAS_HEIGHT / 2,
};
const RAYLEIGH_SCALE_HEIGHT = 8.0;
const NORMAL_STEP_SIZE = 30;
const BETA_R = { r: 0.0058, g: 0.0135, b: 0.0331 };
const PI = Math.PI;
const SUN_DIR_X = 0.5; // Fixed sun direction projected on the ray axis.
const COLOR_CANVAS_BG = 'oklch(98.72% 0.01 274)';
const COLOR_RAY = 'oklch(82.46% 0.07 264)';
const COLOR_LABEL = 'oklch(0% 0 0)';
const COLOR_SAMPLE_FILL = 'oklch(71.73% 0.194 45)';
const COLOR_SAMPLE_STROKE = 'oklch(0% 0 0)';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const rayleighDensity = (altitudeKm: number) =>
  Math.exp(-Math.max(altitudeKm, 0.0) / RAYLEIGH_SCALE_HEIGHT);
const rayleighPhase = (mu: number) => (3 / (16 * PI)) * (1 + mu * mu);

export const Density = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);
  const [stepCount, setStepCount] = useState(20);
  const [observerAltitude, setObserverAltitude] = useState(3.5);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setDpr(window.devicePixelRatio || 1);
    }
  }, []);

  const rayLength = useMemo(() => {
    const dx = RAY_END.x - RAY_START.x;
    const dy = RAY_END.y - RAY_START.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const samples = useMemo(() => {
    const maxStepCount = Math.max(0, Math.floor(rayLength / NORMAL_STEP_SIZE));
    const usedStepCount = Math.max(0, Math.min(stepCount, maxStepCount));
    const stepSize = NORMAL_STEP_SIZE;
    const mu = clamp(SUN_DIR_X, -1, 1);
    const phase = rayleighPhase(mu) / rayleighPhase(0.0);
    let opticalDepth = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    const items: ScatteringSample[] = Array.from(
      { length: usedStepCount },
      (_, i) => {
        const t = ((i + 1.0) * stepSize) / rayLength;
        const position = lerp2(RAY_START, RAY_END, t);

        const altitudeKm = observerAltitude;
        const density = rayleighDensity(altitudeKm);

        opticalDepth += density * stepSize * 0.004;
        const transR = Math.exp(-BETA_R.r * opticalDepth);
        const transG = Math.exp(-BETA_R.g * opticalDepth);
        const transB = Math.exp(-BETA_R.b * opticalDepth);

        const contribR = density * transR * stepSize * BETA_R.r * 0.45 * phase;
        const contribG = density * transG * stepSize * BETA_R.g * 0.45 * phase;
        const contribB = density * transB * stepSize * BETA_R.b * 0.45 * phase;

        sumR += contribR;
        sumG += contribG;
        sumB += contribB;

        return { position, density, lightSamples: [] };
      }
    );

    const exposure = 1.0;
    const accumulationScale = 0.22;

    return {
      items,
      accumulated: {
        r: clamp(sumR * accumulationScale * exposure, 0, 1),
        g: clamp(sumG * accumulationScale * exposure, 0, 1),
        b: clamp(sumB * accumulationScale * exposure, 0, 1),
      },
      stepSize,
      usedStepCount,
    };
  }, [observerAltitude, rayLength, stepCount]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

    ctx.fillStyle = COLOR_CANVAS_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

    // Slanted background strips.
    const canvasWidthPx = CANVAS_WIDTH * dpr;
    const canvasHeightPx = CANVAS_HEIGHT * dpr;
    const stripeSpacing = 19 * dpr;
    const stripeWidth = 8 * dpr;
    const stripeSlant = 70 * dpr;
    ctx.save();
    ctx.strokeStyle = 'oklch(0.7028 0.1608 251.22 / 0.1)';
    ctx.lineWidth = stripeWidth;
    ctx.lineCap = 'butt';
    for (
      let x = -canvasHeightPx - stripeSlant;
      x < canvasWidthPx + stripeSlant;
      x += stripeSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(x + stripeSlant, 0);
      ctx.lineTo(x, canvasHeightPx);
      ctx.stroke();
    }
    ctx.restore();

    // Ray
    ctx.strokeStyle = COLOR_RAY;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(RAY_START.x * dpr, RAY_START.y * dpr);
    ctx.lineTo(RAY_END.x * dpr, RAY_END.y * dpr);
    ctx.stroke();

    // Ray origin marker
    ctx.fillStyle = COLOR_RAY;
    ctx.beginPath();
    ctx.arc(RAY_START.x * dpr, RAY_START.y * dpr, 5 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLOR_SAMPLE_STROKE;
    ctx.lineWidth = 1.0 * dpr;
    ctx.stroke();

    // Sample points along the ray.
    for (const sample of samples.items) {
      const radius = 6 * dpr;
      ctx.fillStyle = COLOR_SAMPLE_FILL;
      ctx.beginPath();
      ctx.arc(
        sample.position.x * dpr,
        sample.position.y * dpr,
        radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = COLOR_SAMPLE_STROKE;
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    }

    // Pixel square showing accumulated scattering color.
    const pxX = CANVAS_WIDTH - PIXEL_SIZE - 10;
    const pxY = CANVAS_HEIGHT - PIXEL_SIZE - 10;
    const pxR = PIXEL_RADIUS * dpr;
    const pxW = PIXEL_SIZE * dpr;
    const pxH = PIXEL_SIZE * dpr;

    ctx.beginPath();
    ctx.moveTo(pxX * dpr + pxR, pxY * dpr);
    ctx.lineTo(pxX * dpr + pxW - pxR, pxY * dpr);
    ctx.arcTo(
      pxX * dpr + pxW,
      pxY * dpr,
      pxX * dpr + pxW,
      pxY * dpr + pxR,
      pxR
    );
    ctx.lineTo(pxX * dpr + pxW, pxY * dpr + pxH - pxR);
    ctx.arcTo(
      pxX * dpr + pxW,
      pxY * dpr + pxH,
      pxX * dpr + pxW - pxR,
      pxY * dpr + pxH,
      pxR
    );
    ctx.lineTo(pxX * dpr + pxR, pxY * dpr + pxH);
    ctx.arcTo(
      pxX * dpr,
      pxY * dpr + pxH,
      pxX * dpr,
      pxY * dpr + pxH - pxR,
      pxR
    );
    ctx.lineTo(pxX * dpr, pxY * dpr + pxR);
    ctx.arcTo(pxX * dpr, pxY * dpr, pxX * dpr + pxR, pxY * dpr, pxR);
    ctx.closePath();

    ctx.fillStyle = `rgb(${Math.round(samples.accumulated.r * 255)}, ${Math.round(
      samples.accumulated.g * 255
    )}, ${Math.round(samples.accumulated.b * 255)})`;
    ctx.fill();
    ctx.strokeStyle = 'oklch(100% 0 0 / 0.6)';
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();

    // Labels
    ctx.fillStyle = COLOR_LABEL;
    ctx.font = `${13 * dpr}px DepartureMono, system-ui, sans-serif`;
    ctx.fillText('0', (RAY_START.x - 12) * dpr, (RAY_START.y - 12) * dpr);
    // ctx.fillText('ray', (RAY_START.x - 26) * dpr, (RAY_START.y - 10) * dpr);
    // ctx.fillText(
    //   `${stepCount} steps`,
    //   (MEDIUM_LEFT + 14) * dpr,
    //   (MEDIUM_TOP + 22) * dpr
    // );
    // ctx.fillText('accumulated pixel', (pxX - 12) * dpr, (pxY - 12) * dpr);
    // ctx.fillText(
    //   `stepSize=${samples.stepSize.toFixed(0)} px`,
    //   (MEDIUM_LEFT + 14) * dpr,
    //   (MEDIUM_TOP + 42) * dpr
    // );
    // ctx.fillText(
    //   `usedSteps=${samples.usedStepCount}`,
    //   (MEDIUM_LEFT + 14) * dpr,
    //   (MEDIUM_TOP + 62) * dpr
    // );

    const labeledLightSample = samples.items[5];
    if (labeledLightSample) {
      drawLeaderLabel(
        ctx,
        dpr,
        'Sample point',
        {
          x: labeledLightSample.position.x + 70,
          y: labeledLightSample.position.y - 60,
        },
        labeledLightSample.position
      );
    }
  }, [dpr, samples]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <Flex direction="column" gap="3">
      <Box
        css={{
          borderRadius: 'var(--border-radius-2)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          display: 'flex',
          backgroundColor: COLOR_CANVAS_BG,
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH * dpr}
          height={CANVAS_HEIGHT * dpr}
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>
      <Flex
        css={{
          width: '100%',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          '@md': {
            flexDirection: 'row',
            alignItems: 'flex-start',
          },
        }}
      >
        <Slider
          id="rayleigh-raymarch-steps"
          label="Raymarch Steps"
          min={0}
          max={20}
          step={1}
          value={stepCount}
          labelValue={`${stepCount}`}
          hideDots
          onChange={setStepCount}
        />

        <Slider
          id="rayleigh-observer-altitude"
          label="Altitude (km)"
          min={0}
          max={12}
          step={0.1}
          value={observerAltitude}
          labelValue={`${observerAltitude.toFixed(1)} km`}
          onChange={setObserverAltitude}
        />
      </Flex>
    </Flex>
  );
};
