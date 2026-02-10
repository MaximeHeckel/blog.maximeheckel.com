import { Box, Flex } from '@maximeheckel/design-system';
// import { useInView } from 'motion/react';
import React, { useDeferredValue, useId, useRef, useState } from 'react';

import { ShaderCanvas } from '@core/components/MDX/Widgets/ShaderCanvas';
import { Slider } from '@core/components/Slider';

const GRID_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uRadius;
uniform float uPixelSize;
uniform sampler2D uTexture;

void main() {
  vec2 pixelCoord = vUv * uResolution;
  
  // Base cell for this pixel
  vec2 baseCellIndex = floor(pixelCoord / uPixelSize);
  
  // Check neighboring cells to find particles covering this pixel
  vec4 finalColor = vec4(0.0);
  float maxCircle = 0.0;
  
  // Search radius - check neighboring cells for overlapping dots
  const int searchRadius = 1;

  for (int dx = -searchRadius; dx <= searchRadius; dx++) {
    for (int dy = -searchRadius; dy <= searchRadius; dy++) {
      vec2 cellIndex = baseCellIndex + vec2(float(dx), float(dy));
      vec2 cellCenter = (cellIndex + 0.5) * uPixelSize;
      
      vec2 uvPixel = cellCenter / uResolution;
      vec4 texColor = texture(uTexture, uvPixel);
      
      float dist = length(pixelCoord - cellCenter);
      
      float radius = uPixelSize * uRadius;
      
      float aa = fwidth(dist);
      float circle = 1.0 - smoothstep(radius - aa, radius + aa, dist);
      
      if (circle > maxCircle) {
        maxCircle = circle;
        finalColor = texColor;
      }
    }
  }
  
  vec3 bgColor = vec3(0.0);
  vec3 color = mix(bgColor, finalColor.rgb, maxCircle);
  
  fragColor = vec4(color, 1.0);
}
`;

export const GridDotsDemo = () => {
  const [radius, setRadius] = useState(0.8);
  const deferredRadius = useDeferredValue(radius);
  const ref = useRef<HTMLDivElement>(null);
  // const isInView = useInView(ref);
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
        {/* {isInView ? ( */}
        <ShaderCanvas
          key={GRID_FRAGMENT}
          fragmentShader={GRID_FRAGMENT}
          uniforms={{
            uRadius: deferredRadius,
            uPixelSize: 16.0,
            uTexture: '/static/backgrounds/landscape.mp4',
          }}
          aspectRatio="16 / 10"
        />
        {/* ) : null} */}
      </Box>
      <Flex
        direction="column"
        gap="4"
        css={{ width: '100%', '@md': { width: '50%', minWidth: 135 } }}
      >
        <Slider
          id={`${id}-radius`}
          label="Radius"
          min={0.5}
          max={1.25}
          step={0.01}
          value={radius}
          onChange={setRadius}
        />
      </Flex>
    </Flex>
  );
};
