import React, { useDeferredValue, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const SIMPLE_GRID_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uRadius;

void main() {
  vec2 cellUv = fract(vUv * 10.0);
  float circle = smoothstep(uRadius - 0.01, uRadius + 0.01, distance(cellUv, vec2(0.5)));
  vec3 color = mix(vec3(0.4, 0.75, 1.0), vec3(0.0, 0.0, 0.0), circle);
  fragColor = vec4(color, 1.0);
}
`;

export const SimpleGridDemo = () => {
  const [radius, setRadius] = useState(0.4);
  const deferredRadius = useDeferredValue(radius);

  return (
    <ShaderPlayground
      key={SIMPLE_GRID_FRAGMENT}
      fragmentShader={SIMPLE_GRID_FRAGMENT}
      uniforms={{ uRadius: deferredRadius }}
      showGrid
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
    </ShaderPlayground>
  );
};
