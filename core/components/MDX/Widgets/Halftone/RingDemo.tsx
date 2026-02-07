import { Box, Flex } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import React, { useDeferredValue, useId, useRef, useState } from 'react';

import { ShaderCanvas } from '@core/components/MDX/Widgets/ShaderCanvas';
import { Slider } from '@core/components/Slider';

const RING_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform sampler2D uTexture;
uniform bool uDisplayLuma;
uniform float split;

const float textureAspect = 1.0;

void main() {
  vec2 uv = vUv;
  vec2 normalizedPixelSize = uPixelSize / uResolution;

  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec2 textureUv = (uv.x < split ? uvPixel : uv) * vec2(1.0, textureAspect);
  vec4 color = texture(uTexture, textureUv);

  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

  vec2 cellUv = fract(uv / normalizedPixelSize);
  float dist = length(cellUv - 0.5);

  float radius = uRadius * (0.2 + luma);
  float edgeWidth = fwidth(dist);

  // --- RINGS ---
  float ringThickness = 0.1;
  float innerRadius = radius - ringThickness;
  float outerCircle = smoothstep(radius - edgeWidth, radius + edgeWidth, dist);
  float innerCircle = smoothstep(innerRadius - edgeWidth, innerRadius + edgeWidth, dist);
  float shape = innerCircle * (1.0 - outerCircle); // 1 inside ring, 0 elsewhere

  color = uv.x < split ? mix(vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.35, 0.0, 1.0), shape) : color;

  fragColor = color;
}
`;

export const RingDemo = () => {
  const [pixelSize, setPixelSize] = useState(8.0);
  const deferredPixelSize = useDeferredValue(pixelSize);
  const [split, setSplit] = useState(0.5);
  const deferredSplit = useDeferredValue(split);

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
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
          aspectRatio: '16 / 10',
          borderRadius: 'var(--border-radius-2)',
          overflow: 'hidden',
        }}
      >
        {isInView ? (
          <ShaderCanvas
            key={RING_FRAGMENT}
            fragmentShader={RING_FRAGMENT}
            uniforms={{
              uRadius: 0.3,
              uPixelSize: deferredPixelSize,
              uTexture: '/static/backgrounds/landscape.mp4',
              split: deferredSplit,
            }}
            aspectRatio="16 / 10"
          />
        ) : null}
      </Box>
      <Flex
        direction="column"
        gap="4"
        css={{ width: '100%', '@md': { width: '50%', minWidth: 135 } }}
      >
        <Slider
          id={`${id}-split`}
          label="Split"
          min={0}
          max={1}
          step={0.01}
          value={split}
          onChange={setSplit}
        />
        <Slider
          id={`${id}-pixelSize`}
          label="Cell Size"
          min={8}
          max={32}
          step={1}
          value={pixelSize}
          onChange={setPixelSize}
        />
      </Flex>
    </Flex>
  );
};
