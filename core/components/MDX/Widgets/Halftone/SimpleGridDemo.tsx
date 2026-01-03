import React, { useDeferredValue, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const SIMPLE_GRID_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uGridSize;

void main() {
  vec2 cellUv = fract(vUv * uGridSize);

  float dist = length(cellUv - 0.5);
  float radius = uRadius * max(max(vUv.x, vUv.y), 0.2);
  
  float circle = smoothstep(radius - 0.01, radius + 0.01, dist);
  vec3 color = mix(vec3(0.4, 0.75, 1.0), vec3(0.0, 0.0, 0.0), circle);
  fragColor = vec4(color, 1.0);
}
`;

export const SimpleGridDemo = () => {
  const [radius, setRadius] = useState(0.4);
  const [gridSize, setGridSize] = useState(10);
  const deferredRadius = useDeferredValue(radius);

  const deferredGridSize = useDeferredValue(gridSize);
  return (
    <ShaderPlayground
      key={SIMPLE_GRID_FRAGMENT}
      fragmentShader={SIMPLE_GRID_FRAGMENT}
      uniforms={{ uRadius: deferredRadius, uGridSize: deferredGridSize }}
      showGrid
      gridSize={gridSize}
    >
      <Slider
        id="radius"
        label="Radius"
        min={0}
        max={0.5}
        step={0.01}
        value={radius}
        onChange={setRadius}
      />
      <Slider
        id="gridSize"
        label="Grid Size"
        min={4}
        max={30}
        step={1}
        value={gridSize}
        onChange={setGridSize}
      />
    </ShaderPlayground>
  );
};
