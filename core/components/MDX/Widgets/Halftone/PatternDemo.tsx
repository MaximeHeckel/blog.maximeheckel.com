import { Checkbox } from '@maximeheckel/design-system';
import React, { useDeferredValue, useId, useState } from 'react';

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
uniform float uColorMode; // 0.0 = color, 1.0 = grayscale, 2.0 = black & white

const float textureAspect = 0.9;

void main() {
  vec2 uv = vUv;
  vec2 normalizedPixelSize = uPixelSize / uResolution;
  vec2 offsetUv = uv;

  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec2 textureUv = (uUsePixelatedUv ? uvPixel : uv) * vec2(1.0, textureAspect);
  vec4 color = texture(uTexture, textureUv);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
  
  // Apply color mode
  if (uColorMode > 0.5 && uColorMode < 1.5) {
    color.rgb = vec3(luma); // Grayscale
  } else if (uColorMode > 1.5) {
    color.rgb = vec3(step(0.5, luma)); // Black & White (threshold at 0.5)
  }

  vec2 cellUv = fract(offsetUv / normalizedPixelSize);
  float cellAspect = normalizedPixelSize.x / normalizedPixelSize.y;
  vec2 toCenter = cellUv - 0.5;
  toCenter.y *= cellAspect;
  float dist = length(toCenter);

  float radius = uDisplayLuma ? uRadius * (0.1 + luma) : uRadius;
  float edgeWidth = fwidth(dist);
  float circle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);

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

const PIXEL_SIZE_STEPS = [8, 16, 32, 64] as const;

export const PatternDemo = (props: { allControls?: boolean }) => {
  const [radius, setRadius] = useState(0.4);
  const [pixelSizeIndex, setPixelSizeIndex] = useState(2); // Default: 32
  const pixelSize = PIXEL_SIZE_STEPS[pixelSizeIndex];
  const deferredRadius = useDeferredValue(radius);
  const deferredPixelSize = useDeferredValue(pixelSize);
  const [usePixelatedUv, setUsePixelatedUv] = useState(true);
  const [displayCircleMask, setDisplayCircleMask] = useState(true);
  const [displayLuma, setDisplayLuma] = useState(false);
  const [colorMode, setColorMode] = useState<
    'color' | 'grayscale' | 'blackwhite'
  >('color');

  const id = useId();

  return (
    <ShaderPlayground
      key={PATTERN_FRAGMENT}
      fragmentShader={PATTERN_FRAGMENT}
      uniforms={{
        uRadius: deferredRadius,
        uTexture: props.allControls
          ? '/static/backgrounds/girl_with_pearl_earing.jpg'
          : '/static/backgrounds/cliff_walk_at_pourville.jpg',
        uUsePixelatedUv: usePixelatedUv,
        uPixelSize: deferredPixelSize,
        uDisplayCircleMask: displayCircleMask,
        uDisplayLuma: displayLuma,
        uColorMode:
          colorMode === 'color' ? 0 : colorMode === 'grayscale' ? 1 : 2,
      }}
      showCode={false}
    >
      <Slider
        id={`${id}-radius`}
        label="Radius"
        min={0}
        max={0.5}
        step={0.01}
        value={radius}
        onChange={setRadius}
      />
      <Slider
        hideDots
        id={`${id}-pixelSize`}
        label="Cell Size"
        labelValue={`${pixelSize} x ${pixelSize}`}
        min={0}
        max={PIXEL_SIZE_STEPS.length - 1}
        step={1}
        value={pixelSizeIndex}
        onChange={setPixelSizeIndex}
      />
      <Checkbox
        id={`${id}-displayCircleMask`}
        aria-label="Display Circle Mask"
        label="Display Circle Mask"
        checked={displayCircleMask}
        onChange={() => setDisplayCircleMask((prev) => !prev)}
      />
      <Checkbox
        id={`${id}-usePixelatedUv`}
        aria-label="Use Pixelated UV"
        label="Use Pixelated UV"
        checked={usePixelatedUv}
        onChange={() => setUsePixelatedUv((prev) => !prev)}
      />
      {props.allControls ? (
        <>
          <Checkbox
            id={`${id}-displayLuma`}
            aria-label="Use Luma based radius"
            label="Use Luma based radius"
            disabled={!displayCircleMask}
            checked={displayLuma}
            onChange={() => setDisplayLuma((prev) => !prev)}
          />
          <Select
            id={`${id}-colorMode`}
            items={[
              { label: 'Colored', value: 'color' },
              { label: 'Grayscale', value: 'grayscale' },
              { label: 'Black & White', value: 'blackwhite' },
            ]}
            value={colorMode}
            onChange={(value) =>
              setColorMode(value as 'color' | 'grayscale' | 'blackwhite')
            }
          />
        </>
      ) : null}
    </ShaderPlayground>
  );
};
