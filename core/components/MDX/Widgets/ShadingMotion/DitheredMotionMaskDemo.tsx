import { Box, Flex } from '@maximeheckel/design-system';
import { useInView } from 'motion/react';
import React, { useDeferredValue, useId, useRef, useState } from 'react';

import { ShaderCanvas } from '@core/components/MDX/Widgets/ShaderCanvas';
import { Slider } from '@core/components/Slider';

const PIXEL_SIZE = 4.0;

const DITHERED_MOTION_MASK_FRAGMENT = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVideo;
uniform sampler2D uVideoPreviousFrame;
uniform sampler2D uPreviousFrame;
uniform vec2 uResolution;
uniform vec2 uVideoSize;
uniform float uMotionThreshold;
uniform float uDecayRate;
uniform float uPixelSize;
uniform float split;

const float bayerMatrix4x4[16] = float[16](
  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,
  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,
  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,
  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0
);

const float bayerMatrix8x8[64] = float[64](
  0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,
  32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,
  8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,
  40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,
  2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,
  34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,
  10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,
  42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0
);

float luminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

vec2 getCoverVideoUv(vec2 uv) {
  if (uVideoSize.x <= 0.0 || uVideoSize.y <= 0.0) {
    return uv;
  }

  float canvasAspect = uResolution.x / uResolution.y;
  float videoAspect = uVideoSize.x / uVideoSize.y;
  vec2 coverUv = uv - 0.5;

  if (canvasAspect > videoAspect) {
    coverUv.y *= videoAspect / canvasAspect;
  } else {
    coverUv.x *= canvasAspect / videoAspect;
  }

  return coverUv + 0.5;
}

vec2 getPixelatedUv(vec2 uv) {
  vec2 normalizedPixelSize = vec2(uPixelSize) / uResolution;

  return normalizedPixelSize * (floor(uv / normalizedPixelSize) + 0.5);
}

float getDitherThreshold(vec2 uv) {
  ivec2 coord = ivec2(mod(floor((uv * uResolution) / uPixelSize), 4.0));

  return bayerMatrix4x4[coord.y * 4 + coord.x];
}

void main() {
  vec2 videoUv = getCoverVideoUv(vUv);
  vec3 currentFrame = texture(uVideo, videoUv).rgb;
  vec3 outputColor = currentFrame;
  float storedMask = 0.0;

  if (vUv.x > split) {
    vec2 pixelatedUv = getPixelatedUv(vUv);
    vec2 pixelatedVideoUv = getCoverVideoUv(pixelatedUv);
    vec3 pixelatedFrame = texture(uVideo, pixelatedVideoUv).rgb;
    vec3 previousFrame = texture(uVideoPreviousFrame, pixelatedVideoUv).rgb;
    float motion = luminance(abs(pixelatedFrame - previousFrame));
    float rawMask = smoothstep(uMotionThreshold, uMotionThreshold + 0.04, motion);
    float decayedMask = texture(uPreviousFrame, pixelatedUv).a * uDecayRate;
    float motionMask = max(rawMask, decayedMask);
    float activeMask = step(0.1, motionMask);

    float ditheredMask = step(getDitherThreshold(vUv), motionMask) * activeMask;

    storedMask = motionMask;
    outputColor = mix(
      vec3(0.1333, 0.5098, 0.9373),
      vec3(1.0),
      ditheredMask
    );
  }

  fragColor = vec4(outputColor, storedMask);
}
`;

export const DitheredMotionMaskDemo = () => {
  const [split, setSplit] = useState(0.5);
  const deferredSplit = useDeferredValue(split);

  const LANDSCAPE_VIDEO_URL =
    'https://cdn.maximeheckel.com/videos/footages/clouds.mp4';

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
            key={DITHERED_MOTION_MASK_FRAGMENT}
            fragmentShader={DITHERED_MOTION_MASK_FRAGMENT}
            uniforms={{
              uDecayRate: 0.94,
              uMotionThreshold: 0.005,
              uPixelSize: PIXEL_SIZE,
              uVideo: LANDSCAPE_VIDEO_URL,
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
        {/* <Slider
          id={`${id}-motion-threshold`}
          label="Motion Threshold"
          min={0}
          max={0.4}
          step={0.01}
          value={motionThreshold}
          onChange={setMotionThreshold}
          hideDots
        /> */}
      </Flex>
    </Flex>
  );
};
