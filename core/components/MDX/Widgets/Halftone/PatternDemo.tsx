import { Box, Checkbox } from '@maximeheckel/design-system';
import React, { useDeferredValue, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Select } from '@core/components/Select';
import { Slider } from '@core/components/Slider';

const PATTERN_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform sampler2D uTexture;
uniform bool uUsePixelatedUv;
uniform bool uDisplayCircleMask;
uniform bool uDisplayLuma;
uniform bool uGrayscale;

const float textureAspect = 0.9;

void main() {
  vec2 uv = vUv;
  vec2 normalizedPixelSize = uPixelSize / uResolution;

  // === Option 1: No offset (grid pattern) ===
  vec2 offsetUv = uv;

  // === Option 2: Offset every other row by half a cell (staggered/hexagonal pattern) ===
  // float row = floor(uv.y / normalizedPixelSize.y);
  // vec2 offsetUv = uv;
  // offsetUv.x += mod(row, 2.0) * normalizedPixelSize.x * 0.5;

  // === Option 3: Sine wave offset (wavy pattern) ===
  // float column = floor(uv.x / normalizedPixelSize.x);
  // vec2 offsetUv = uv;
  // float waveFrequency = 0.2;  // Adjust for tighter/looser waves
  // float waveAmplitude = 0.5;  // 0.5 = half cell offset at peak
  // offsetUv.y += sin(column * waveFrequency) * normalizedPixelSize.x * waveAmplitude;

  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec2 textureUv = (uUsePixelatedUv ? uvPixel : uv) * vec2(1.0, textureAspect);
  vec4 color = texture(uTexture, textureUv);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
  color.rgb = uGrayscale ? vec3(luma) : color.rgb;

  vec2 cellUv = fract(offsetUv / normalizedPixelSize);
  float cellAspect = normalizedPixelSize.x / normalizedPixelSize.y;
  vec2 toCenter = cellUv - 0.5;
  toCenter.y *= cellAspect;
  float dist = length(toCenter);

  float radius = uDisplayLuma ? uRadius * (0.1 + luma) : uRadius;

  // Hard cutoff (aliased, sharp edges)
  // float circle = dist < radius ? 0.0 : 1.0;

  // Antialiasing approaches (uncomment one):
  // 1. Fixed-width smoothstep (simple, consistent blur)
  // float circle = smoothstep(radius - 0.01, radius + 0.01, dist);

  // 2. Pixel-perfect antialiasing using fwidth (adapts to screen resolution)
  float edgeWidth = fwidth(dist);
  float circle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);

  // 3. Wider soft edge (more glow-like)
  //float circle = smoothstep(radius - 0.15, radius + 0.15, dist);

  // circle = 0 inside, 1 outside
  // Option A: Multiply (dark circles)
  float circleMask = uDisplayCircleMask ? circle : 0.0;
  color = mix(color, vec4(0.0), circleMask);

  // Option B: White circles at center
  // float circleMask = uDisplayCircleMask ? (1.0 - circle) : 0.0;
  // color = mix(color, vec4(1.0), circleMask);

  // ========================================
  // RENDERING OPTIONS (uncomment one)
  // ========================================

  // // --- RINGS ---
  // float ringThickness = 0.1;
  // float innerRadius = radius - ringThickness;
  // float outerCircle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);
  // float innerCircle = smoothstep(innerRadius - edgeWidth, innerRadius + edgeWidth, dist);
  // float shape = innerCircle * (1.0 - outerCircle); // 1 inside ring, 0 elsewhere

  // // --- FOR RINGS (shape = 1 inside ring, 0 elsewhere) ---
  // // White rings on black background
  // float mask = uDisplayCircleMask ? shape : 0.0;
  // color = uv.x < 0.5 ? mix(vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.5, 0.0, 1.0), mask) : color;

  // // Texture color in rings, black background
  // // float mask = uDisplayCircleMask ? shape : 0.0;
  // // color = mix(vec4(0.0, 0.0, 0.0, 1.0), color, mask);

  fragColor = color;
}
`;

export const PatternDemo = () => {
  const [radius, setRadius] = useState(0.4);
  const [pixelSize, setPixelSize] = useState(48.0);
  const deferredRadius = useDeferredValue(radius);
  const deferredPixelSize = useDeferredValue(pixelSize);
  const [usePixelatedUv, setUsePixelatedUv] = useState(true);
  const [displayCircleMask, setDisplayCircleMask] = useState(true);
  const [displayLuma, setDisplayLuma] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  return (
    <ShaderPlayground
      key={PATTERN_FRAGMENT}
      fragmentShader={PATTERN_FRAGMENT}
      uniforms={{
        uRadius: deferredRadius,
        uTexture: '/static/backgrounds/girl_with_pearl_earing.jpg',
        uUsePixelatedUv: usePixelatedUv,
        uPixelSize: deferredPixelSize,
        uDisplayCircleMask: displayCircleMask,
        uDisplayLuma: displayLuma,
        uGrayscale: grayscale,
      }}
      showGrid
      showCode={false}
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
        id="pixelSize"
        label="Pixel Size"
        min={4}
        max={64}
        step={1}
        value={pixelSize}
        onChange={setPixelSize}
      />
      <Checkbox
        id="displayCircleMask"
        aria-label="Display Circle Mask"
        label="Display Circle Mask"
        checked={displayCircleMask}
        onChange={() => setDisplayCircleMask((prev) => !prev)}
      />
      <Checkbox
        id="usePixelatedUv"
        aria-label="Use Pixelated UV"
        label="Use Pixelated UV"
        checked={usePixelatedUv}
        onChange={() => setUsePixelatedUv((prev) => !prev)}
      />
      <Checkbox
        id="displayLuma"
        aria-label="Use Luma based radius"
        label="Use Luma based radius"
        disabled={!displayCircleMask}
        checked={displayLuma}
        onChange={() => setDisplayLuma((prev) => !prev)}
      />
      <Box
        as="hr"
        css={{
          width: '100%',
          height: '1px',
          backgroundColor: 'var(--border-color)',
          border: 'none',
        }}
      />
      <Select
        id="grayscale"
        items={[
          { label: 'Colored', value: 'color' },
          { label: 'Grayscale', value: 'grayscale' },
        ]}
        value={grayscale ? 'grayscale' : 'color'}
        onChange={(value) => setGrayscale(value === 'grayscale')}
      />
    </ShaderPlayground>
  );
};
