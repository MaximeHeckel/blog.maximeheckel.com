import { Checkbox } from '@maximeheckel/design-system';
import React, { useDeferredValue, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Select } from '@core/components/Select';
import { Slider } from '@core/components/Slider';

const MOIRE_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform float uAngle;
uniform bool uType;
uniform bool uDebug;

mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 1.234));
}

float circleGrid(vec2 uv, float radius, float angle) {
  vec2 normalizedPixelSize = uPixelSize / uResolution;
  
  // Apply rotation to UV before calculating cell
  vec2 uvPx = uv * uResolution;
  vec2 rotatedPx = rotate(angle) * uvPx;
  vec2 rotatedUv = rotatedPx / uResolution;
  
  vec2 cellUv = fract(rotatedUv / normalizedPixelSize);
  float edgeWidth = fwidth(distance(cellUv, vec2(0.5)));
  float adjustedRadius = clamp(radius * uv.x, 0.1, 0.8);
  float circle = smoothstep(adjustedRadius - edgeWidth, adjustedRadius + edgeWidth, distance(cellUv, vec2(0.5)));
  return circle;
}

float poissonDots(vec2 uv, float radius, float angle) {
  vec2 seed = vec2(0.0, 0.0);
  vec2 uvPx = uv * uResolution;
  vec2 centerPx = 0.5 * uResolution;
  vec2 rotatedPx = rotate(angle) * (uvPx - centerPx) + centerPx;
  float cellSizePx = uPixelSize;
  vec2 gridUv = (rotatedPx / cellSizePx) + seed;
  vec2 baseCell = floor(gridUv);
  float minDist = 1e6;
  float density = 0.65;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cell = baseCell + vec2(x, y);
      vec2 rand = hash2(cell);
      float isActive = step(rand.x, density);
      vec2 point = (cell + rand - seed) * cellSizePx;
      float distToPoint = distance(rotatedPx, point);
      minDist = min(minDist, mix(1e6, distToPoint, isActive));
    }
  }

  float edgeWidth = fwidth(minDist);
  float dotRadius = clamp(radius, 0.1, 0.3) * cellSizePx;
  return smoothstep(dotRadius - edgeWidth, dotRadius + edgeWidth, minDist);
}

void main() {
  vec2 uv = vUv;
  
  float circleGridA = uType
    ? circleGrid(uv, uRadius, 0.0)
    : poissonDots(uv, uRadius, 0.0);
  float circleGridB = uType
    ? circleGrid(uv, uRadius, radians(uAngle))
    : poissonDots(uv, uRadius, radians(uAngle));
  vec3 colorA = mix(vec3(0.6), vec3(0.0, 0.0, 0.0), circleGridA);
  vec3 colorB = mix(vec3(0.6), vec3(0.0, 0.0, 0.0), circleGridB);

  if (uDebug) {
    colorA = mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, 0.0), circleGridA);
    colorB = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), circleGridB);
  }


  fragColor = vec4(max(colorA, colorB), 1.0);
}
`;

export const MoireDemo = () => {
  const [pixelSize, setPixelSize] = useState(16.0);
  const [angle, setAngle] = useState(0.0);
  const [debug, setDebug] = useState(false);
  const [type, setType] = useState('circleGrid');
  const deferredPixelSize = useDeferredValue(pixelSize);
  const deferredAngle = useDeferredValue(angle);

  return (
    <ShaderPlayground
      key={MOIRE_FRAGMENT}
      fragmentShader={MOIRE_FRAGMENT}
      uniforms={{
        uRadius: 0.4,
        uPixelSize: deferredPixelSize,
        uAngle: deferredAngle,
        uType: type === 'circleGrid',
        uDebug: debug,
      }}
      showGrid={false}
      showCode={false}
    >
      <Select
        id="type"
        items={[
          { label: 'Circle Grid', value: 'circleGrid' },
          { label: 'Poisson Dots', value: 'poissonDots' },
        ]}
        value={type}
        minWidth={135}
        onChange={(value) => setType(value as 'circleGrid' | 'poissonDots')}
      />
      <Slider
        id="pixelSize"
        label="Pixel Size"
        min={4}
        max={64}
        step={1}
        value={pixelSize}
        onChange={setPixelSize}
      />
      <Slider
        id="angle"
        label="Angle"
        min={0}
        max={type === 'circleGrid' ? 90 : 5}
        step={0.25}
        value={angle}
        onChange={setAngle}
      />
      <Checkbox
        id="debug"
        aria-label="Debug"
        label="Debug"
        checked={debug}
        onChange={() => setDebug((prev) => !prev)}
      />
    </ShaderPlayground>
  );
};
