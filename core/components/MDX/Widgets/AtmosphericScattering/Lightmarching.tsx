import { Checkbox } from '@maximeheckel/design-system';
import React, { useDeferredValue, useId, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const LIGHTMARCHING_FRAGMENNT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float uCameraPitch;
uniform float uObserverAltitude;
uniform bool uMieEnabled;
uniform bool uOzoneEnabled;
uniform float uSunAngle;
uniform float uLightmarchingSteps;
uniform vec2 uResolution;

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
const vec3 SPACE_COLOR = vec3(0.0);
const float SUN_ANGLE_MIN = radians(-1.0);
const float SUN_ANGLE_MAX = radians(181.0);
const float SUN_ARC_X_MIN = -0.85;
const float SUN_ARC_X_MAX = 0.85;


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

// Integrate optical depth from a sample point toward the sun.
vec3 lightMarch(float startHeight, float sunY) {
  float denom = max(sunY + 0.15, 0.04);
  float maxDist = (ATMOSPHERE_HEIGHT - startHeight) / denom;
  float stepSize = max(maxDist, 0.0) / float(uLightmarchingSteps);
  float odR = 0.0;
  float odM = 0.0;
  float odO = 0.0;

  for (int i = 0; i < int(uLightmarchingSteps); i++) {
    float t = (float(i) + 0.5) * stepSize;
    float h = startHeight + t * sunY;
    if (h < 0.0 || h > ATMOSPHERE_HEIGHT) {
      continue;
    }

    odR += rayleighDensity(h) * stepSize;
    if (uMieEnabled) odM += mieDensity(h) * stepSize;
    if (uOzoneEnabled) odO += ozoneDensity(h) * stepSize;
  }

  return vec3(odR, odM, odO);
}

float softSunDisc(vec2 p, vec3 sunDir, float pitch, float discScale) {
  const float BASE_RADIUS = 0.012;
  float radius = BASE_RADIUS * max(discScale, 0.1);

  float c = cos(pitch);
  float s = sin(pitch);
  vec3 sunCamera = vec3(
    sunDir.x,
    sunDir.y * c - sunDir.z * s,
    sunDir.y * s + sunDir.z * c
  );

  if (sunCamera.z <= 1e-5) {
    return 0.0;
  }

  vec2 sunP = sunCamera.xy / sunCamera.z;
  float d = length(p - sunP);

  // Soft center plus a wider aureole so bloom can pick it up naturally.
  float core = exp(-pow(d / max(radius * 0.7, 1e-5), 2.0));
  float limb = smoothstep(radius * 1.3, radius * 0.2, d);
  float halo = exp(-d / max(radius * 18.0, 1e-5));
  return core * limb + 0.25 * halo;
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
  p.x *= uResolution.x / max(uResolution.y, 1.0);

  vec3 baseDir = vec3(p.x, p.y, 1.0);
  float pitch = radians(clamp(uCameraPitch, 0.0, 90.0));
  float c = cos(pitch);
  float s = sin(pitch);
  float pitchedY = baseDir.y * c + baseDir.z * s;
  float pitchedZ = -baseDir.y * s + baseDir.z * c;
 
  float sunIntensity = SUN_INTENSITY *smoothstep(-0.08, 0.03, uSunAngle);
  float sunDiscSize = 0.1;

  vec3 viewDir = normalize(vec3(baseDir.x, pitchedY, pitchedZ));
  // Clamp to horizon so below-horizon pixels keep horizon sky color.
  vec3 skyDir = normalize(vec3(viewDir.x, max(viewDir.y, 0.0), viewDir.z));

  float sunArcT = clamp(
    (uSunAngle - SUN_ANGLE_MIN) / max(SUN_ANGLE_MAX - SUN_ANGLE_MIN, 1e-5),
    0.0,
    1.0
  );
  float sunX = mix(SUN_ARC_X_MIN, SUN_ARC_X_MAX, sunArcT);
  float sunY = sin(uSunAngle);
  float sunZ = abs(cos(uSunAngle));
  vec3 sunDirection = normalize(vec3(sunX, sunY, sunZ));
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

    vec3 sunOD = uSunAngle > 0.0 && uSunAngle < PI ? lightMarch(h, sunDirection.y) : vec3(1000.0);
    vec3 tau = BETA_R * (viewODR + sunOD.x)
      + (uMieEnabled ? BETA_M_EXT * (viewODM + sunOD.y) : vec3(0.0))
      + (uOzoneEnabled ? BETA_OZONE_ABS * (viewODO + sunOD.z) : vec3(0.0));
    vec3 transmittance = exp(-tau);

    sumR += dR * transmittance * stepSize;
    sumM += dM * transmittance * stepSize;
    sumO += dO * transmittance * stepSize;
  }

  vec3 scattering = sunIntensity * (
    phaseR * BETA_R * sumR +
    (uMieEnabled ? phaseM * BETA_M_SCATTER * sumM : vec3(0.0)) +
    (uOzoneEnabled ? BETA_OZONE_SCATTER * sumO : vec3(0.0))
  );

  float horizon = smoothstep(-0.12, 0.05, skyDir.y);
  float sunShape = softSunDisc(p, sunDirection, pitch, sunDiscSize);
  vec3 sunTint = vec3(1.0, 0.97, 0.92);
  vec3 sunDiscLight = sunTint * sunIntensity * 12.0 * sunShape * scattering;
    
  vec3 color = mix(SPACE_COLOR, scattering, horizon);
  color += sunDiscLight;
  color = ACESFilm(color);

  fragColor = vec4(color, 1.0);
}
`;

export const Lightmarching = () => {
  const [cameraPitch, setCameraPitch] = useState(20);
  const [sunAngle, setSunAngle] = useState(2.5);
  const [lightmarchingSteps, setLightmarchingSteps] = useState(6);
  const [mieEnabled, setMieEnabled] = useState(true);
  const [ozoneEnabled, setOzoneEnabled] = useState(true);
  const deferredCameraPitch = useDeferredValue(cameraPitch);
  const deferredSunAngle = useDeferredValue(sunAngle);
  const deferredLightmarchingSteps = useDeferredValue(lightmarchingSteps);

  const id = useId();

  return (
    <ShaderPlayground
      key={LIGHTMARCHING_FRAGMENNT}
      fragmentShader={LIGHTMARCHING_FRAGMENNT}
      uniforms={{
        uCameraPitch: deferredCameraPitch,
        uObserverAltitude: 0.0,
        uMieEnabled: mieEnabled,
        uOzoneEnabled: ozoneEnabled,
        uSunAngle: (deferredSunAngle * Math.PI) / 180,
        uLightmarchingSteps: deferredLightmarchingSteps,
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
        id={`${id}-sunAngle`}
        label="Sun Angle"
        min={-1}
        max={181}
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
      <Slider
        id={`${id}-lightmarchingSteps`}
        label="Light Steps"
        min={0}
        max={8}
        step={1}
        hideDots
        value={lightmarchingSteps}
        labelValue={`${lightmarchingSteps}`}
        onChange={setLightmarchingSteps}
      />
    </ShaderPlayground>
  );
};
