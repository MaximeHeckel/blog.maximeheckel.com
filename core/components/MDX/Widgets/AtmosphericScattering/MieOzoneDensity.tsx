import { Checkbox } from '@maximeheckel/design-system';
import React, { useDeferredValue, useId, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const MIE_OZONE_FRAGMENNT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float uCameraPitch;
uniform float uObserverAltitude;
uniform bool uMieEnabled;
uniform bool uOzoneEnabled;
uniform float uSunAngle;

const float PI = 3.14159265;
const float SUN_INTENSITY = 25.0;
const float RAYLEIGH_SCALE_HEIGHT = 8.0; // km
const float MIE_SCALE_HEIGHT = 1.2; // km
const float ATMOSPHERE_HEIGHT = 100.0; // km - Karman line
const float VIEW_DISTANCE = 200.0; // km
const int PRIMARY_STEPS = 24;
const vec3 BETA_R = vec3(0.0058, 0.0135, 0.0331);
const vec3 BETA_M_SCATTER = vec3(0.003, 0.003, 0.003);
const vec3 BETA_M_EXT = vec3(0.0044, 0.0044, 0.0044);
const float MIE_G = 0.8;
const vec3 BETA_OZONE_ABS = vec3(0.00065, 0.00188, 0.00008);
const vec3 BETA_OZONE_SCATTER = vec3(0.00005, 0.00005, 0.00005);
const vec3 SUN_DIRECTION = normalize(vec3(0.0, 1.0, 1.0));
const vec3 SPACE_COLOR = vec3(0.0);


float rayleighPhase(float mu) {
  return 3.0 / (16.0 * PI) * (1.0 + mu * mu);
}

float rayleighDensity(float h) {
  return exp(-max(h, 0.0) / RAYLEIGH_SCALE_HEIGHT);
}

float miePhase(float mu) {
  float gg = MIE_G * MIE_G;
  float num = 3.0 * (1.0 - gg) * (1.0 + mu * mu);
  float den = 8.0 * PI * (2.0 + gg) * pow(max(1.0 + gg - 2.0 * MIE_G * mu, 1e-4), 1.5);
  return num / den;
}

float mieDensity(float h) {
  return exp(-max(h, 0.0) / MIE_SCALE_HEIGHT);
}

float ozoneDensity(float h) {
  float lower = smoothstep(10.0, 25.0, h);
  float upper = 1.0 - smoothstep(30.0, 50.0, h);
  return lower * upper;
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
  vec3 rayDir = normalize(vec3(baseDir.x, pitchedY, pitchedZ));
  // Clamp to horizon so below-horizon pixels keep horizon sky color.
  vec3 skyDir = normalize(vec3(rayDir.x, max(rayDir.y, 0.0), rayDir.z));

  vec3 sunDirection = vec3(0.0, sin(uSunAngle), cos(uSunAngle));
  float mu = dot(skyDir, sunDirection);
  float phaseR = rayleighPhase(mu);
  float phaseM = miePhase(mu);


  float stepSize = VIEW_DISTANCE / float(PRIMARY_STEPS);
  float viewODR = 0.0;
  float viewODM = 0.0;
  float viewODO = 0.0;
  vec3 sumR = vec3(0.0);
  vec3 sumM = vec3(0.0);
  vec3 sumO = vec3(0.0);

  for (int i = 0; i < PRIMARY_STEPS; i++) {
    float t = (float(i) + 0.5) * stepSize;
    float h = uObserverAltitude + t * skyDir.y;
    if (h < 0.0) break;
    if (h > ATMOSPHERE_HEIGHT) break;

    float dR = rayleighDensity(h);
    float dM = uMieEnabled ? mieDensity(h) : 0.0;
    float dO = uOzoneEnabled ? ozoneDensity(h) : 0.0;
    viewODR += dR * stepSize;
    viewODM += dM * stepSize;
    viewODO += dO * stepSize;

    vec3 tau = BETA_R * viewODR
      + (uMieEnabled ? BETA_M_EXT * viewODM : vec3(0.0))
      + (uOzoneEnabled ? BETA_OZONE_ABS * viewODO : vec3(0.0));
    vec3 transmittance = exp(-tau);

    sumR += dR * transmittance * stepSize;
    sumM += dM * transmittance * stepSize;
    sumO += dO * transmittance * stepSize;
  }

  vec3 scattering = SUN_INTENSITY * (
    phaseR * BETA_R * sumR +
    (uMieEnabled ? phaseM * BETA_M_SCATTER * sumM : vec3(0.0)) +
    (uOzoneEnabled ? BETA_OZONE_SCATTER * sumO : vec3(0.0))
  );

  float horizon = smoothstep(-0.12, 0.05, skyDir.y);
  vec3 color = mix(SPACE_COLOR, scattering, horizon);
  color = ACESFilm(color);

  fragColor = vec4(color, 1.0);
}
`;

export const MieOzoneDensity = () => {
  const [cameraPitch, setCameraPitch] = useState(20);
  const [observerAltitude, setObserverAltitude] = useState(0.0);
  const [sunAngle, setSunAngle] = useState(45);
  const [mieEnabled, setMieEnabled] = useState(true);
  const [ozoneEnabled, setOzoneEnabled] = useState(true);
  const deferredCameraPitch = useDeferredValue(cameraPitch);
  const deferredObserverAltitude = useDeferredValue(observerAltitude);
  const deferredSunAngle = useDeferredValue(sunAngle);

  const id = useId();

  return (
    <ShaderPlayground
      key={MIE_OZONE_FRAGMENNT}
      fragmentShader={MIE_OZONE_FRAGMENNT}
      uniforms={{
        uCameraPitch: deferredCameraPitch,
        uObserverAltitude: deferredObserverAltitude,
        uMieEnabled: mieEnabled,
        uOzoneEnabled: ozoneEnabled,
        uSunAngle: (deferredSunAngle * Math.PI) / 180,
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
      <Slider
        id={`${id}-sunAngle`}
        label="Sun Angle"
        min={0}
        max={90}
        step={0.01}
        value={sunAngle}
        labelValue={`${sunAngle.toFixed(2)}°`}
        onChange={setSunAngle}
      />
      <Checkbox
        id={`${id}-mieEnabled`}
        aria-label="Enable Mie scattering"
        label="Mie"
        checked={mieEnabled}
        onChange={() => setMieEnabled((prev) => !prev)}
      />
      <Checkbox
        id={`${id}-ozoneEnabled`}
        aria-label="Enable ozone"
        label="Ozone"
        checked={ozoneEnabled}
        onChange={() => setOzoneEnabled((prev) => !prev)}
      />
    </ShaderPlayground>
  );
};
