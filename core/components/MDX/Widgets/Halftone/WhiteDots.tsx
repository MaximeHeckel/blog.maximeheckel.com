import { Box, Flex } from '@maximeheckel/design-system';
import React, { useDeferredValue, useId, useRef, useState } from 'react';

import { Slider } from '@core/components/Slider';

import { ShaderCanvas } from '../ShaderCanvas';

const WHITE_DOTS_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform sampler2D uTexture;

void main() {
  vec2 uv = vUv;
  vec2 normalizedPixelSize = uPixelSize / uResolution;
  vec2 offsetUv = uv;

  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
  vec4 color = texture(uTexture, uvPixel);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
  
  vec2 cellUv = fract(offsetUv / normalizedPixelSize);
  vec2 toCenter = cellUv - 0.5;
  float dist = length(toCenter);

  float radius = uRadius * (1.0 - luma + 0.1);
  float edgeWidth = fwidth(dist);
  float circle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);

  float circleMask = (1.0 - circle);
  color = mix(color, vec4(1.0), circleMask);

  fragColor = color;
}
`;

const PIXEL_SIZE_STEPS = [8, 16, 32, 64] as const;

export const WhiteDots = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [radius, setRadius] = useState(0.25);
  const [pixelSizeIndex, setPixelSizeIndex] = useState(1); // Default: 32
  const pixelSize = PIXEL_SIZE_STEPS[pixelSizeIndex];
  const deferredRadius = useDeferredValue(radius);
  const deferredPixelSize = useDeferredValue(pixelSize);
  const id = useId();

  return (
    <Flex
      alignItems="center"
      direction="column"
      gap="4"
      css={{
        maxWidth: 662,
        width: '100%',
      }}
    >
      <Box
        ref={ref}
        css={{
          width: '100%',
          borderRadius: 'var(--border-radius-2)',
          overflow: 'hidden',
          aspectRatio: '16 / 10',
        }}
      >
        <ShaderCanvas
          key={WHITE_DOTS_FRAGMENT}
          fragmentShader={WHITE_DOTS_FRAGMENT}
          uniforms={{
            uRadius: deferredRadius,
            uPixelSize: deferredPixelSize,
            uTexture: '/static/backgrounds/landscape.mp4',
          }}
          aspectRatio="16 / 10"
        />
      </Box>
      <Flex direction="column" gap="4" css={{ width: '50%', minWidth: 135 }}>
        <Slider
          id={`${id}-pixelSize`}
          label="Pixel Size"
          labelValue={`${pixelSize} x ${pixelSize}`}
          min={0}
          max={PIXEL_SIZE_STEPS.length - 1}
          step={1}
          value={pixelSizeIndex}
          onChange={setPixelSizeIndex}
          hideDots
        />
        <Slider
          id={`${id}-radius`}
          label="Radius"
          min={0.1}
          max={0.5}
          step={0.01}
          value={radius}
          onChange={setRadius}
        />
      </Flex>
    </Flex>
  );
};
