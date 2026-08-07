import { Switch } from '@maximeheckel/design-system';
import React, { useDeferredValue, useId, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const MOTION_MASK_VIDEO_URL =
  'https://cdn.maximeheckel.com/videos/footages/bloom-60fps.mp4';

const MOTION_MASK_FRAGMENT = `#version 300 es
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
uniform bool uShowMotionMask;
uniform bool uShowVideo;
uniform bool uUseDecay;
uniform bool uRenderEffect;
uniform bool uRenderFlow;
uniform bool uFeedbackPass;

float luminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

vec3 getHeatColor(float heat) {
  vec3 cool = vec3(0.0, 0.5, 2.0);
  vec3 hot = vec3(1.0, 0.35, 0.5);

  return mix(cool, hot, heat);
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

void main() {
  vec2 videoUv = getCoverVideoUv(vUv);
  vec3 currentFrame = texture(uVideo, videoUv).rgb;

  if (!uShowMotionMask) {
    fragColor = vec4(currentFrame, 1.0);
    return;
  }

  if (uRenderFlow) {
    vec3 previousFrame = texture(uVideoPreviousFrame, videoUv).rgb;
    float currentValue = luminance(currentFrame);
    float previousValue = luminance(previousFrame);
    float difference = abs(currentValue - previousValue);
    float upperThreshold = max(
      uMotionThreshold * 10.0,
      uMotionThreshold + 0.0001
    );
    float motionAmount = smoothstep(
      uMotionThreshold,
      upperThreshold,
      difference
    ) * 10.0;
    vec2 videoTexel = 1.0 / max(uVideoSize, vec2(1.0));
    vec2 leftUv = clamp(videoUv - vec2(videoTexel.x, 0.0), 0.0, 1.0);
    vec2 rightUv = clamp(videoUv + vec2(videoTexel.x, 0.0), 0.0, 1.0);
    vec2 upUv = clamp(videoUv - vec2(0.0, videoTexel.y), 0.0, 1.0);
    vec2 downUv = clamp(videoUv + vec2(0.0, videoTexel.y), 0.0, 1.0);
    float leftMatch = abs(
      currentValue - luminance(texture(uVideoPreviousFrame, leftUv).rgb)
    );
    float rightMatch = abs(
      currentValue - luminance(texture(uVideoPreviousFrame, rightUv).rgb)
    );
    float upMatch = abs(
      currentValue - luminance(texture(uVideoPreviousFrame, upUv).rgb)
    );
    float downMatch = abs(
      currentValue - luminance(texture(uVideoPreviousFrame, downUv).rgb)
    );
    vec2 rawFlow = vec2(
      rightMatch - leftMatch,
      downMatch - upMatch
    );
    float flowLength = length(rawFlow);
    vec2 flowDirection = vec2(0.0);

    if (flowLength > 0.001 && motionAmount > 0.0) {
      flowDirection = rawFlow / flowLength;
    }

    vec4 previousTrail = texture(uPreviousFrame, vUv);
    vec2 previousFlow = previousTrail.gb * 2.0 - 1.0;
    vec2 trailFlow = mix(
      previousFlow * uDecayRate,
      flowDirection,
      clamp(motionAmount, 0.0, 1.0)
    );
    vec2 encodedTrailFlow = trailFlow * 0.5 + 0.5;
    float trailAlpha = max(previousTrail.a * uDecayRate, motionAmount);
    // R = luminance, GB = encoded flow direction, A = trail persistence.
    vec4 flowTexture = vec4(
      currentValue,
      encodedTrailFlow,
      clamp(trailAlpha, 0.0, 1.0)
    );

    if (uFeedbackPass) {
      fragColor = flowTexture;
      return;
    }

    vec3 flowColor = vec3(currentValue, encodedTrailFlow);
    float overlayStrength = clamp(trailAlpha, 0.0, 1.0) * 0.9;
    vec3 flowFrame = uShowVideo
      ? mix(currentFrame, flowColor, overlayStrength)
      : flowColor * overlayStrength;

    fragColor = vec4(flowFrame, 1.0);
    return;
  }

  if (uRenderEffect) {
    vec3 previousFrame = texture(uVideoPreviousFrame, videoUv).rgb;
    float motion = luminance(abs(currentFrame - previousFrame));
    float rawMask = smoothstep(uMotionThreshold, uMotionThreshold + 0.04, motion);
    float decayedMask = texture(uPreviousFrame, vUv).a * uDecayRate;
    float mask = rawMask;
    mask = max(mask, decayedMask);

    float heat = rawMask > 0.001 ? 1.0 : decayedMask;
    vec3 heatColor = getHeatColor(heat);
    vec3 highlightedFrame = mix(currentFrame, heatColor, mask * 1.3);
    vec3 effectFrame = uShowVideo ? highlightedFrame : heatColor * mask;

    fragColor = vec4(effectFrame, mask);
    return;
  }

  vec3 previousFrame = texture(uVideoPreviousFrame, videoUv).rgb;
  vec3 frameDifference = abs(currentFrame - previousFrame);

  float motion = luminance(frameDifference);
  float rawMask = smoothstep(uMotionThreshold, uMotionThreshold + 0.4, motion);
  float mask = rawMask;

  if (uUseDecay) {
    float previousMask = texture(uPreviousFrame, vUv).r * uDecayRate;
    mask = max(rawMask, previousMask);
  }

  fragColor = vec4(vec3(mask), 1.0);
}
`;

type MotionMaskVariant = 'mask' | 'decayedMask' | 'effect' | 'flow';

interface MotionMaskProps {
  variant?: MotionMaskVariant;
}

export const MotionMask = (props: MotionMaskProps) => {
  const { variant = 'mask' } = props;
  const useDecay =
    variant === 'decayedMask' || variant === 'effect' || variant === 'flow';
  const renderEffect = variant === 'effect';
  const renderFlow = variant === 'flow';

  const [motionThreshold, setMotionThreshold] = useState(
    variant === 'effect' || variant === 'flow' ? 0.02 : 0.08
  );
  const [decayRate, setDecayRate] = useState(
    variant === 'effect' || variant === 'flow' ? 0.95 : 0.8
  );
  const [showMotionMask, setShowMotionMask] = useState(true);
  const [showVideo, setShowVideo] = useState(variant !== 'flow');
  const deferredMotionThreshold = useDeferredValue(motionThreshold);
  const deferredDecayRate = useDeferredValue(decayRate);
  const id = useId();

  return (
    <ShaderPlayground
      key={MOTION_MASK_FRAGMENT}
      fragmentShader={MOTION_MASK_FRAGMENT}
      uniforms={{
        uShowMotionMask: showMotionMask,
        uShowVideo: showVideo,
        uUseDecay: useDecay,
        uRenderEffect: renderEffect,
        uRenderFlow: renderFlow,
        uMotionThreshold: deferredMotionThreshold,
        uDecayRate: deferredDecayRate,
        uVideo: MOTION_MASK_VIDEO_URL,
      }}
      aspectRatio="4 / 4"
      fullBleedWidth={50}
      showCode={false}
    >
      <Switch
        id={`${id}-show-motion-mask`}
        aria-label="Enable motion mask"
        label="Enable motion mask"
        checked={showMotionMask}
        onChange={() => setShowMotionMask((value) => !value)}
      />
      <Slider
        id={`${id}-motion-threshold`}
        label="Threshold"
        min={0}
        max={0.5}
        step={0.01}
        value={motionThreshold}
        onChange={setMotionThreshold}
      />
      {useDecay ? (
        <Slider
          id={`${id}-decay-rate`}
          label="Decay"
          min={0}
          max={0.99}
          step={0.01}
          value={decayRate}
          onChange={setDecayRate}
        />
      ) : null}
      {renderEffect ? (
        <Switch
          id={`${id}-show-video`}
          aria-label="Show video"
          label="Show video"
          checked={showVideo}
          onChange={() => setShowVideo((value) => !value)}
        />
      ) : null}
    </ShaderPlayground>
  );
};
