import {
  Box,
  Flex,
  Icon,
  IconButton,
  Tooltip,
} from '@maximeheckel/design-system';
import { useReducedMotion } from 'motion/react';
import { useEffect, useId, useState } from 'react';

import { Select } from '@core/components/Select';
import { Slider } from '@core/components/Slider';

import { ShaderPlayground } from '../ShaderPlayground';

const fragment = `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform sampler2D uBlueNoise;
uniform vec2 uBlueNoiseSize;
uniform highp sampler2D uPreviousFrame;
uniform bool uFeedbackPass;
uniform bool uPlaying;
uniform float uHysteresis;
uniform float uEpoch;
uniform float uGridSize;
uniform float uView;

float sampleBlueNoise(ivec2 cell, int frame) {
  ivec2 size = ivec2(uBlueNoiseSize);
  ivec2 coord = (cell + frame * ivec2(59, 83)) % size;
  coord.y = size.y - 1 - coord.y;
  float value = texelFetch(uBlueNoise, coord, 0).r;

  return (value * 255.0 + 0.5) / 256.0;
}

vec3 linearColor(vec3 color) {
  return mix(pow((color + 0.055) / 1.055, vec3(2.4)), color / 12.92,
    lessThanEqual(color, vec3(0.04045)));
}

vec3 displayColor(vec3 color) {
  color = clamp(color, 0.0, 1.0);

  return mix(1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055, 12.92 * color,
    lessThanEqual(color, vec3(0.0031308)));
}

vec2 corner(int index) {
  if (index == 0) return vec2(0.10, 0.10);
  if (index == 1) return vec2(-0.10, 0.10);
  if (index == 2) return vec2(-0.10, -0.10);

  return vec2(0.10, -0.10);
}

vec2 imageOffset(float time) {
  // Start centered, then visit top right, top left, bottom left, bottom right.
  // Each leg moves for 1.4 seconds and holds for another 2.6 seconds.
  int leg = int(floor(time / 4.0));
  float progress = smoothstep(0.0, 1.4, mod(time, 4.0));
  vec2 from = leg == 0 ? vec2(0.0) : corner((leg - 1) % 4);
  vec2 to = corner(leg % 4);

  return mix(from, to, progress);
}

void main() {
  if (any(lessThan(uTextureSize, vec2(2.0))) ||
      any(lessThan(uBlueNoiseSize, vec2(2.0)))) {
    fragColor = uFeedbackPass ? vec4(0.0) : vec4(0.04, 0.05, 0.06, 1.0);
    return;
  }

  // Fixed texture locations represent fixed measurement locations. Moving the
  // image changes the measured signal; no history reprojection is performed.
  vec4 metadata = texelFetch(uPreviousFrame, ivec2(0, 0), 0);
  vec4 motion = texelFetch(uPreviousFrame, ivec2(1, 0), 0);
  vec4 settings = texelFetch(uPreviousFrame, ivec2(2, 0), 0);
  bool reset = abs(metadata.r - uEpoch) > 0.1;

  // Advance only while visible/rendering. Pausing motion still gathers samples.
  float deltaTime = reset ? 0.0 : clamp(uTime - motion.z, 0.0, 0.05);
  float motionTime = reset ? 0.0 : motion.w;
  motionTime += uPlaying ? deltaTime : 0.0;
  vec2 offset = imageOffset(motionTime);
  bool moving = reset || distance(offset, motion.xy) > 0.000001;
  bool settingsChanged = abs(settings.r - uHysteresis) > 0.0001;

  float count = reset ? 1.0 : min(metadata.g + 1.0, 1024.0);
  float frame = reset ? 0.0 : mod(metadata.b + 1.0, 4096.0);
  float stableFrames = moving || settingsChanged ? 0.0 : min(metadata.a + 1.0, 1024.0);

  vec2 gridSize = uGridSize * uResolution / min(uResolution.x, uResolution.y);
  ivec2 cell = ivec2(floor(vUv * gridSize));
  vec2 sampleUv = (vec2(cell) + 0.5) / gridSize;
  float canvasAspect = uResolution.x / uResolution.y;
  float textureAspect = uTextureSize.x / uTextureSize.y;
  vec2 scale = textureAspect > canvasAspect
    ? vec2(canvasAspect / textureAspect, 1.0)
    : vec2(1.0, textureAspect / canvasAspect);
  // Slightly zoom in so translation never exposes clamped image edges.
  vec2 imageUv = (sampleUv - 0.5 - offset) * scale / 1.25 + 0.5;
  vec3 reference = linearColor(texture(uTexture, imageUv).rgb);

  ivec2 pixel = ivec2(gl_FragCoord.xy);

  // Reserve three texels for history, motion, and control metadata.
  if (pixel.y == 0 && pixel.x < 3) {
    vec4 data = pixel.x == 0 ? vec4(uEpoch, count, frame, stableFrames)
      : pixel.x == 1 ? vec4(offset, uTime, motionTime)
      : vec4(uHysteresis, 0.0, 0.0, 0.0);
    fragColor = uFeedbackPass ? data : vec4(displayColor(reference), 1.0);
    return;
  }

  const float hitProbability = 0.25;
  vec3 fresh = sampleBlueNoise(cell, int(frame)) < hitProbability
    ? reference / hitProbability : vec3(0.0);

  vec3 history = texelFetch(uPreviousFrame, pixel, 0).rgb;

  // GI8's persistent-history blend, including warm-up, a growing window while
  // stationary, and the 1024-frame cap. Motion/settings changes reset only the
  // stability timer, preserving the previous lighting estimate.
  float window = min(1.0 / (1.0 - uHysteresis) + stableFrames, 1024.0);
  float retention = min(1.0 - 1.0 / window, 1.0 - 1.0 / count);
  vec3 average = reset ? fresh : mix(fresh, history, retention);

  vec3 visible = uView < 0.5 ? average : fresh;

  // Both passes calculate the same next value from the previous history.
  fragColor = uFeedbackPass ? vec4(average, 1.0) : vec4(displayColor(visible), 1.0);
}
`;

export default function ImageHysteresis() {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [hysteresis, setHysteresis] = useState(0.95);
  const [epoch, setEpoch] = useState(1);
  const [gridSize, setGridSize] = useState('48');
  const [view, setView] = useState('0');

  useEffect(() => {
    setPlaying(!reducedMotion);
  }, [reducedMotion]);

  return (
    <ShaderPlayground
      fragmentShader={fragment}
      floatingPointFeedback
      showCode={false}
      uniforms={{
        uTexture:
          'https://cdn.maximeheckel.com/images/backgrounds/flowers.webp',
        uBlueNoise: 'https://cdn.maximeheckel.com/noises/blue-noise.png',
        uHysteresis: hysteresis,
        uEpoch: epoch,
        uGridSize: Number(gridSize),
        uPlaying: playing,
        uView: Number(view),
      }}
    >
      <Slider
        id={`${id}-hysteresis`}
        label="Hysteresis"
        labelValue={hysteresis.toFixed(2)}
        min={0}
        max={0.99}
        step={0.01}
        value={hysteresis}
        onChange={setHysteresis}
      />
      <Select
        id={`${id}-view`}
        label="View"
        size="md"
        value={view}
        items={[
          { label: 'Blended history', value: '0' },
          { label: 'Current sample', value: '1' },
        ]}
        onChange={(value) => {
          if (value !== null) setView(value);
        }}
      />
      <Select
        id={`${id}-pixel-size`}
        label="Pixel size"
        size="md"
        value={gridSize}
        items={[
          { label: 'Small', value: '96' },
          { label: 'Medium', value: '48' },
          { label: 'Large', value: '24' },
        ]}
        onChange={(value) => {
          if (value === null) return;

          setGridSize(value);
          setEpoch((previous) => previous + 1);
        }}
      />
      <Box css={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
        <Flex gap="3" alignItems="center">
          <Tooltip
            id={`${id}-motion-tip`}
            content={playing ? 'Pause motion; keep sampling' : 'Resume motion'}
          >
            <IconButton
              rounded
              size="small"
              variant="tertiary"
              type="button"
              aria-label={playing ? 'Pause motion' : 'Resume motion'}
              aria-describedby={`${id}-motion-tip`}
              onClick={() => setPlaying((previous) => !previous)}
            >
              {playing ? (
                <Icon.Pause aria-hidden="true" />
              ) : (
                <Icon.Play aria-hidden="true" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip
            id={`${id}-restart-tip`}
            content="Restart motion and history"
          >
            <IconButton
              rounded
              size="small"
              variant="tertiary"
              type="button"
              aria-label="Restart motion and history"
              aria-describedby={`${id}-restart-tip`}
              onClick={() => setEpoch((previous) => previous + 1)}
            >
              <Icon.Repeat aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </Flex>
      </Box>
    </ShaderPlayground>
  );
}
