import React, { useDeferredValue, useId, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const RAYLEIGH_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float uCameraPitch;
uniform float uObserverAltitude;

const float PI = 3.14159265;
const float SUN_INTENSITY = 25.0;
const float RAYLEIGH_SCALE_HEIGHT = 8.0; // km
const float ATMOSPHERE_HEIGHT = 100.0; // km - Karman line
const float VIEW_DISTANCE = 200.0; // km
const int PRIMARY_STEPS = 24;
const vec3 BETA_R = vec3(0.0058, 0.0135, 0.0331);
const vec3 SUN_DIRECTION = normalize(vec3(0.0, 1.0, 1.0));
const vec3 SPACE_COLOR = vec3(0.0);

float rayleighPhase(float mu) {
  return 3.0 / (16.0 * PI) * (1.0 + mu * mu);
}

float rayleighDensity(float h) {
  return exp(-max(h, 0.0) / RAYLEIGH_SCALE_HEIGHT);
}

vec3 ACESFilm(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;

  vec3 baseDir = vec3(p.x, p.y, 1.0);
  float pitch = radians(clamp(uCameraPitch, 0.0, 90.0));
  float c = cos(pitch);
  float s = sin(pitch);
  float pitchedY = baseDir.y * c + baseDir.z * s;
  float pitchedZ = -baseDir.y * s + baseDir.z * c;
  vec3 viewDir = normalize(vec3(baseDir.x, pitchedY, pitchedZ));
  // Clamp to horizon so below-horizon pixels keep horizon sky color.
  vec3 skyDir = normalize(vec3(viewDir.x, max(viewDir.y, 0.0), viewDir.z));
  float phase = rayleighPhase(dot(skyDir, SUN_DIRECTION));

  float stepSize = VIEW_DISTANCE / float(PRIMARY_STEPS);
  float viewOpticalDepth = 0.0;
  vec3 scattering = vec3(0.0);

  for (int i = 0; i < PRIMARY_STEPS; i++) {
    float t = (float(i) + 0.5) * stepSize;
    float h = uObserverAltitude + t * skyDir.y;
    if (h < 0.0) break;
    if (h > ATMOSPHERE_HEIGHT) break;

    float dR = rayleighDensity(h);
    viewOpticalDepth += dR * stepSize;

    vec3 transmittance = exp(-BETA_R * viewOpticalDepth);
    scattering += dR * transmittance * stepSize;
  }

  scattering *= SUN_INTENSITY * phase * BETA_R;

  float horizon = smoothstep(-0.12, 0.05, skyDir.y);
  vec3 color = mix(SPACE_COLOR, scattering, horizon);
  color = ACESFilm(color);

  fragColor = vec4(color, 1.0);
}
`;

export const RayleighDensity = () => {
  const [cameraPitch, setCameraPitch] = useState(20);
  const [observerAltitude, setObserverAltitude] = useState(2.0);
  const deferredCameraPitch = useDeferredValue(cameraPitch);
  const deferredObserverAltitude = useDeferredValue(observerAltitude);

  const id = useId();

  return (
    <ShaderPlayground
      key={RAYLEIGH_FRAGMENT}
      fragmentShader={RAYLEIGH_FRAGMENT}
      uniforms={{
        uCameraPitch: deferredCameraPitch,
        uObserverAltitude: deferredObserverAltitude,
      }}
      showCode={false}
    >
      <Slider
        id={`${id}-cameraPitch`}
        label="Camera Pitch"
        min={0}
        max={90}
        step={1}
        value={cameraPitch}
        onChange={setCameraPitch}
      />
      <Slider
        id={`${id}-observerAltitude`}
        label="Altitude (km)"
        min={0}
        max={20}
        step={0.1}
        value={observerAltitude}
        onChange={setObserverAltitude}
      />
    </ShaderPlayground>
  );
};
