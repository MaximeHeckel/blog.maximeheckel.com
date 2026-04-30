import { Checkbox } from '@maximeheckel/design-system';
import React, { useId, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';

const TRANSMITTANCE_LUT_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform bool uOzoneEnabled;
uniform bool uShowPathExtinctionDebug;

const float PLANET_RADIUS = 6360.0;
const float ATMOSPHERE_RADIUS = 6460.0;
const float RAYLEIGH_SCALE_HEIGHT = 8.0;
const vec3 RAYLEIGH_BETA = vec3(0.0058, 0.0135, 0.0331);
const float MIE_SCALE_HEIGHT = 1.2;
const float MIE_BETA_EXT = 0.0044;
const float OZONE_CENTER_HEIGHT = 25.0;
const float OZONE_WIDTH = 15.0;
const vec3 OZONE_BETA_ABS = vec3(0.00065, 0.00188, 0.00008);

const int TRANSMITTANCE_STEPS = 40;

vec2 raySphereIntersect(
  vec3 rayOrigin,
  vec3 rayDir,
  vec3 sphereCenter,
  float sphereRadius
) {
  vec3 oc = rayOrigin - sphereCenter;
  float b = dot(oc, rayDir);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  float discriminant = b * b - c;

  if (discriminant < 0.0) {
    return vec2(-1.0, -1.0);
  }

  float sqrtD = sqrt(discriminant);
  return vec2(-b - sqrtD, -b + sqrtD);
}

float rayleighDensity(vec3 point) {
  float altitude = length(point) - PLANET_RADIUS;
  return exp(-max(altitude, 0.0) / RAYLEIGH_SCALE_HEIGHT);
}

float mieDensity(vec3 point) {
  float altitude = length(point) - PLANET_RADIUS;
  return exp(-max(altitude, 0.0) / MIE_SCALE_HEIGHT);
}

float ozoneDensity(vec3 point) {
  float altitude = length(point) - PLANET_RADIUS;
  return max(0.0, 1.0 - abs(altitude - OZONE_CENTER_HEIGHT) / OZONE_WIDTH);
}

void main() {
  float radius = mix(PLANET_RADIUS, ATMOSPHERE_RADIUS, vUv.y);
  float muMin = -sqrt(max(1.0 - (PLANET_RADIUS * PLANET_RADIUS) / (radius * radius), 0.0));
  float mu = mix(muMin, 1.0, vUv.x);

  vec3 rayOrigin = vec3(0.0, radius, 0.0);
  float sinTheta = sqrt(max(1.0 - mu * mu, 0.0));
  vec3 rayDir = normalize(vec3(sinTheta, mu, 0.0));

  vec2 atmosphereHit = raySphereIntersect(
    rayOrigin,
    rayDir,
    vec3(0.0),
    ATMOSPHERE_RADIUS
  );
  float rayLength = atmosphereHit.y;

  if (rayLength <= 0.0) {
    fragColor = vec4(1.0);
    return;
  }

  float stepSize = rayLength / float(TRANSMITTANCE_STEPS);
  float rayleighOD = 0.0;
  float mieOD = 0.0;
  float ozoneOD = 0.0;

  // Build one texel of the transmittance LUT by raymarching from an
  // atmospheric sample point toward the top of the atmosphere. We integrate
  // optical depth along that light path for Rayleigh, Mie, and ozone, then
  // convert the accumulated extinction into transmittance with exp(-tau).
  for (int i = 0; i < TRANSMITTANCE_STEPS; i++) {
    float t = (float(i) + 0.5) * stepSize;
    vec3 samplePoint = rayOrigin + rayDir * t;

    rayleighOD += rayleighDensity(samplePoint) * stepSize;
    mieOD += mieDensity(samplePoint) * stepSize;

    if (uOzoneEnabled) {
      ozoneOD += ozoneDensity(samplePoint) * stepSize;
    }
  }

  vec3 tau = RAYLEIGH_BETA * rayleighOD
    + vec3(MIE_BETA_EXT * mieOD)
    + OZONE_BETA_ABS * ozoneOD;
  vec3 transmittance = exp(-tau);

  if (uShowPathExtinctionDebug) {
    // Path extinction = fraction of sunlight removed along the path.
    // 0.0 means almost no loss, 1.0 means nearly complete extinction.
    vec3 pathExtinction = max(vec3(0.0), 1.0 - transmittance);
    vec3 debugColor = pow(pathExtinction, vec3(0.5));
    fragColor = vec4(debugColor, 1.0);
    return;
  }

  fragColor = vec4(transmittance, 1.0);
}
`;

/**
 *
 * Each LUT pixel stores RGB transmittance for one atmospheric light path.
 * Height (Y) maps sample altitude from ground level (bottom) to top of the
 * atmosphere (top). Width (X) maps sun-angle via mu, from near-horizon
 * grazing paths on the left to near-vertical/upward paths on the right.
 *
 * Debug output ("Path Extinction Debug") visualizes 1 - transmittance:
 * the fraction of sunlight removed along that path. Dark = little loss,
 * bright = strong extinction.
 * 
 * Most of the domain is near white → for many (altitude, sun-angle) pairs, transmittance is high (little extinction), especially at higher altitude / less grazing directions.
Strong colored band on the left edge → grazing/horizon paths are much longer through air, so extinction is much stronger there.
Bottom-left is darkest/warmest → low altitude + grazing path is the worst-case optical depth; blue gets removed more, so surviving light looks red/orange.
Bottom row stays slightly tinted → even with less grazing, ground-level paths still cross denser air than high-altitude ones.
Smooth transition toward top-right → physically sensible monotonic behavior (shorter/cleaner paths -> higher transmittance).

Upward rays: point away from the planet (toward space).
Grazing rays: run almost tangent to atmospheric layers, i.e. horizon-like / nearly horizontal locally.
That’s why grazing paths accumulate much more optical depth.

Yes — perfectly stated.

Higher transmittance (T closer to 1) -> more light survives -> appears whiter/brighter in this LUT view.
Lower transmittance (T closer to 0) -> less light survives (more extinction) -> appears darker/more tinted.

Equivalent relationship:

Extinction fraction = 1 - T ( debug mode).
 */
export const TransmittanceLUT = () => {
  const [ozoneEnabled, setOzoneEnabled] = useState(true);
  const [showPathExtinctionDebug, setShowPathExtinctionDebug] = useState(false);

  const id = useId();

  return (
    <ShaderPlayground
      key={TRANSMITTANCE_LUT_FRAGMENT}
      fragmentShader={TRANSMITTANCE_LUT_FRAGMENT}
      uniforms={{
        uOzoneEnabled: ozoneEnabled,
        uShowPathExtinctionDebug: showPathExtinctionDebug,
      }}
      showCode={false}
      aspectRatio="1 / 1"
    >
      <Checkbox
        id={`${id}-ozoneEnabled`}
        aria-label="Enable ozone absorption"
        label="Ozone"
        checked={ozoneEnabled}
        onChange={() => setOzoneEnabled((prev) => !prev)}
      />
      <Checkbox
        id={`${id}-pathExtinctionDebug`}
        aria-label="Show path extinction debug view"
        label="Path Extinction Debug"
        checked={showPathExtinctionDebug}
        onChange={() => setShowPathExtinctionDebug((prev) => !prev)}
      />
    </ShaderPlayground>
  );
};
