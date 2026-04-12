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
const CANVAS_HEIGHT = 420;
const MEDIUM_LEFT = 0;
const MEDIUM_WIDTH = 760;
const PIXEL_SIZE = 64;
const PIXEL_RADIUS = 6;
const PRIMARY_SAMPLE_COUNT = 4;
const VIEW_INTEGRATION_STEPS = 24;
const LIGHTMARCH_STEPS = 4;
const RAY_START: Vec2 = {
  x: MEDIUM_LEFT + 60,
  y: CANVAS_HEIGHT - CANVAS_HEIGHT / 4,
};
const RAY_END: Vec2 = {
  x: MEDIUM_LEFT + MEDIUM_WIDTH - 70,
  y: CANVAS_HEIGHT - CANVAS_HEIGHT / 4,
};
const OBSERVER_ALTITUDE = 0.0;
const RAYLEIGH_SCALE_HEIGHT = 8.0;
const BETA_R = { r: 0.0058, g: 0.0135, b: 0.0331 };
const PI = Math.PI;
const SUN_INTENSITY = 10.0;
const COLOR_CANVAS_BG = 'oklch(98.72% 0.01 274)';
const COLOR_RAY = 'oklch(82.46% 0.07 264)';
const COLOR_LABEL = 'oklch(0% 0 0)';
const COLOR_SAMPLE_FILL = 'oklch(71.73% 0.194 45)';
const COLOR_SAMPLE_STROKE = 'oklch(0% 0 0)';
const COLOR_LIGHT_RAY = 'oklch(91.50% 0.189 100.9)';

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
const clamp01 = (v: number) => clamp(v, 0, 1);
const acesFilm = (x: number) => {
  const a = 2.51;
  const b = 0.03;
  const c = 2.43;
  const d = 0.59;
  const e = 0.14;
  return clamp01((x * (a * x + b)) / (x * (c * x + d) + e));
};
const distance = (a: Vec2, b: Vec2) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const Density = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);
  const [sunAngle, setSunAngle] = useState(35.0);

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
    const sunAngleRad = (sunAngle * Math.PI) / 180;
    const sunDir = { x: Math.cos(sunAngleRad), y: -Math.sin(sunAngleRad) };
    const mu = clamp(sunDir.x, -1, 1);
    const phase = rayleighPhase(mu);
    const rayMid = lerp2(RAY_START, RAY_END, 0.5);
    const sunOrbitRadius = 220;
    const sunPosition = {
      x: rayMid.x + Math.cos(sunAngleRad) * sunOrbitRadius,
      y: rayMid.y - Math.sin(sunAngleRad) * sunOrbitRadius,
    };

    // Keep 4 points for visual explanation.
    const items: ScatteringSample[] = Array.from(
      { length: PRIMARY_SAMPLE_COUNT },
      (_, i) => {
        const t = (i + 1.0) / (PRIMARY_SAMPLE_COUNT + 1.0);
        const position = lerp2(RAY_START, RAY_END, t);
        const lightSamples = Array.from(
          { length: LIGHTMARCH_STEPS },
          (_, j) => {
            const lightT = (j + 1.0) / (LIGHTMARCH_STEPS + 1.0);
            return lerp2(position, sunPosition, lightT);
          }
        );
        return {
          position,
          density: rayleighDensity(OBSERVER_ALTITUDE),
          lightSamples,
        };
      }
    );

    // Use denser integration for color to better match the shader.
    const viewStepSize = rayLength / VIEW_INTEGRATION_STEPS;
    let viewOpticalDepth = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    for (let i = 0; i < VIEW_INTEGRATION_STEPS; i++) {
      const t = (i + 0.5) / VIEW_INTEGRATION_STEPS;
      const p = lerp2(RAY_START, RAY_END, t);
      const density = rayleighDensity(OBSERVER_ALTITUDE);
      viewOpticalDepth += density * viewStepSize * 0.004;

      const lightStepSize =
        distance(p, sunPosition) / Math.max(LIGHTMARCH_STEPS, 1);
      let sunOpticalDepth = 0;
      for (let j = 0; j < LIGHTMARCH_STEPS; j++) {
        const lightT = (j + 0.5) / LIGHTMARCH_STEPS;
        const lightP = lerp2(p, sunPosition, lightT);
        const lightAltitudeKm =
          (1 - lightP.y / CANVAS_HEIGHT) * OBSERVER_ALTITUDE;
        const lightDensity = rayleighDensity(lightAltitudeKm);
        sunOpticalDepth += lightDensity * lightStepSize * 0.004;
      }

      const transR = Math.exp(-BETA_R.r * (viewOpticalDepth + sunOpticalDepth));
      const transG = Math.exp(-BETA_R.g * (viewOpticalDepth + sunOpticalDepth));
      const transB = Math.exp(-BETA_R.b * (viewOpticalDepth + sunOpticalDepth));

      sumR += density * transR * viewStepSize;
      sumG += density * transG * viewStepSize;
      sumB += density * transB * viewStepSize;
    }

    const scatteringR = SUN_INTENSITY * phase * BETA_R.r * sumR;
    const scatteringG = SUN_INTENSITY * phase * BETA_R.g * sumG;
    const scatteringB = SUN_INTENSITY * phase * BETA_R.b * sumB;
    const displayScale = 0.35;

    return {
      items,
      accumulated: {
        r: acesFilm(scatteringR * displayScale),
        g: acesFilm(scatteringG * displayScale),
        b: acesFilm(scatteringB * displayScale),
      },
      stepSize: viewStepSize,
      usedStepCount: VIEW_INTEGRATION_STEPS,
      sunPosition,
    };
  }, [rayLength, sunAngle]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

    ctx.fillStyle = COLOR_CANVAS_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH * dpr, CANVAS_HEIGHT * dpr);

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

    // Sun marker.
    ctx.fillStyle = COLOR_LIGHT_RAY;
    ctx.beginPath();
    ctx.arc(
      samples.sunPosition.x * dpr,
      samples.sunPosition.y * dpr,
      20 * dpr,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.fill();

    // Lightmarch rays for a couple of primary samples.
    ctx.lineWidth = 1.25 * dpr;
    for (const sample of samples.items) {
      ctx.strokeStyle = 'oklch(91.50% 0.189 100.9 / 0.8)';
      ctx.beginPath();
      ctx.moveTo(sample.position.x * dpr, sample.position.y * dpr);
      ctx.lineTo(samples.sunPosition.x * dpr, samples.sunPosition.y * dpr);
      ctx.stroke();

      for (const lightSample of sample.lightSamples) {
        ctx.fillStyle = COLOR_LIGHT_RAY;
        ctx.beginPath();
        ctx.arc(
          lightSample.x * dpr,
          lightSample.y * dpr,
          3 * dpr,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = COLOR_SAMPLE_STROKE;
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
      }
    }

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

    const labeledLightSample = samples.items[0]?.lightSamples[2];
    if (labeledLightSample) {
      drawLeaderLabel(
        ctx,
        dpr,
        'Light sample point',
        {
          x: labeledLightSample.x - 100,
          y: labeledLightSample.y - 80,
        },
        labeledLightSample,
        { flipLabel: true }
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
          id="rayleigh-sun-angle"
          label="Sun Angle"
          min={10}
          max={90}
          step={0.1}
          value={sunAngle}
          labelValue={`${sunAngle.toFixed(1)}°`}
          onChange={setSunAngle}
        />
      </Flex>
    </Flex>
  );
};
