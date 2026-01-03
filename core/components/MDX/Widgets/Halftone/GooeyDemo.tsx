import React, { useDeferredValue, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const GOOEY_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uGooeyness;

// Exponential smooth minimum - symmetric when applied to multiple values
float sminExp(float a, float b, float k) {
    if (k <= 0.001) return min(a, b);
    float res = exp(-k * a) + exp(-k * b);
    return -log(res) / k;
}

float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

void main() {
  float gridSize = 4.0;
  vec2 gridUV = vUv * gridSize;
  vec2 cellIndex = floor(gridUV);

  // Center of the grid
  vec2 gridCenter = vec2(gridSize * 0.5);

  // Smoothness factor - higher = more gooey
  float smoothK = (1.0 - uGooeyness) * 8.0;

  // Start with a large distance (no shape)
  float minDist = 100.0;

  // Check neighborhood of cells
  for (float ox = -2.0; ox <= 2.0; ox += 1.0) {
    for (float oy = -2.0; oy <= 2.0; oy += 1.0) {
      vec2 neighborCell = cellIndex + vec2(ox, oy);

      // DIAGONAL GRID: Only place dots where (row + col) is even
      // Creates checkerboard pattern for diagonal connections
      if (mod(neighborCell.x + neighborCell.y, 2.0) > 0.5) {
        continue;
      }

      vec2 neighborCenter = neighborCell + 0.5;

      // Calculate distance from dot center to grid center
      float distToCenter = length(neighborCenter - gridCenter);
      // Normalize (max distance is ~gridSize * 0.707 for corners)
      float maxDist = gridSize * 0.5 * 1.414;
      float normalizedDist = distToCenter / maxDist;

      // Dots closer to center are bigger, dots at edges are smaller
      // Clamp to prevent negative radius (which breaks the SDF)
      float radiusScale = max(0.05, 1.0 - normalizedDist * 1.2);
      float adjustedRadius = uRadius * radiusScale;

      // Distance from THIS PIXEL to the neighbor's center
      float dist = length(gridUV - neighborCenter);

      // Get signed distance to this dot (negative inside, positive outside)
      float dotDist = dist - adjustedRadius;

      // Use exponential smooth min for symmetric blending
      minDist = sminExp(minDist, dotDist, smoothK);
    }
  }

  // Convert SDF to shape with antialiasing
  float aa = fwidth(minDist);
  float finalShape = 1.0 - smoothstep(-aa, aa, minDist);

  vec3 color = mix(vec3(0.0), vec3(0.4, 0.75, 1.0), finalShape);
  fragColor = vec4(color, 1.0);
}
`;

export const GooeyDemo = () => {
  const [radius, setRadius] = useState(0.65);
  const [gooeyness, setGooeyness] = useState(0.65);
  const deferredRadius = useDeferredValue(radius);
  const deferredGooeyness = useDeferredValue(gooeyness);

  return (
    <ShaderPlayground
      key={GOOEY_FRAGMENT}
      fragmentShader={GOOEY_FRAGMENT}
      uniforms={{ uRadius: deferredRadius, uGooeyness: deferredGooeyness }}
      showGrid
      showCode={false}
      gridSize={4}
    >
      <Slider
        id="radius"
        label="Radius"
        min={0}
        max={0.75}
        step={0.01}
        value={radius}
        onChange={setRadius}
      />
      <Slider
        id="gooeyness"
        label="Gooeyness"
        min={0}
        max={0.75}
        step={0.01}
        value={gooeyness}
        onChange={setGooeyness}
      />
    </ShaderPlayground>
  );
};
