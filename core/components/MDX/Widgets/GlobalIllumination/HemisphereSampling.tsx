import { useId, useState } from 'react';

import { Slider } from '@core/components/Slider';

import { ShaderPlayground } from '../ShaderPlayground';

const fragment = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uCount;
uniform float uBatch;
uniform float uView;

vec2 hash23(vec3 seed) {
  vec2 h = vec2(dot(seed, vec3(127.1, 311.7, 74.7)), dot(seed, vec3(269.5, 183.3, 246.1)));
  return fract(sin(h) * 43758.5453);
}
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 d = b - a;
  return length(p - a - d * clamp(dot(p - a, d) / max(dot(d, d), 0.00001), 0.0, 1.0));
}
// Orthographic display only: sampling still happens on a 3D hemisphere.
vec2 projectDirection(vec3 d) {
  float angle = radians(uView);
  return vec2(d.x, d.y * cos(angle) - d.z * sin(angle));
}
void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 2.8;
  p.y += 0.25;
  float aa = 2.8 / uResolution.y;
  vec3 color = vec3(0.035, 0.04, 0.055);
  vec3 accent = vec3(0.275, 0.49, 0.94);
  // Great-circle guides establish the hemisphere's shape.
  float guide = 10.0;
  for (int j = 0; j < 64; j++) {
    float a = float(j) / 64.0 * 6.2831853;
    float b = float(j + 1) / 64.0 * 6.2831853;
    guide = min(guide, segment(p, projectDirection(vec3(cos(a), 0, sin(a))), projectDirection(vec3(cos(b), 0, sin(b)))));
    float c = a * 0.5;
    float e = b * 0.5;
    guide = min(guide, segment(p, projectDirection(vec3(cos(c), sin(c), 0)), projectDirection(vec3(cos(e), sin(e), 0))));
  }
  color = mix(color, vec3(0.29, 0.32, 0.38), 1.0 - smoothstep(aa, aa * 2.0, guide));
  for (int i = 0; i < 64; i++) {
    if (float(i) >= uCount) break;
    // GI9 hash, bounded frame phase and stratification of the tilt sample.
    // Fix the atlas coordinate to one representative probe/lobe texel.
    vec3 seed = vec3(0.37, 0.61, (float(i) + mod(uBatch, 4096.0) * uCount + 0.5) / (4096.0 * uCount));
    vec2 random = hash23(seed);
    float u = (float(i) + random.x) / uCount;
    float phi = 6.2831853 * random.y;
    vec3 direction = vec3(sqrt(u) * cos(phi), sqrt(1.0 - u), sqrt(u) * sin(phi));
    vec2 tip = projectDirection(direction);
    float ray = 1.0 - smoothstep(aa * 0.6, aa * 1.6, segment(p, vec2(0), tip));
    color = mix(color, accent, ray * 0.4);
    float dotMask = 1.0 - smoothstep(0.017, 0.017 + aa, length(p - tip));
    color = mix(color, accent, dotMask);
  }
  color = mix(color, vec3(0.85), 1.0 - smoothstep(0.025, 0.025 + aa, length(p)));
  fragColor = vec4(color, 1);
}`;

export default function HemisphereSampling() {
  const id = useId();
  const [count, setCount] = useState(16);
  const [batch, setBatch] = useState(0);
  const [view, setView] = useState(25);

  return (
    <ShaderPlayground
      fragmentShader={fragment}
      uniforms={{ uCount: count, uBatch: batch, uView: view }}
      showCode={false}
    >
      <Slider
        id={`${id}-count`}
        label="Directions"
        min={4}
        max={64}
        step={1}
        value={count}
        onChange={setCount}
      />
      <Slider
        id={`${id}-batch`}
        label="Sample batch"
        min={0}
        max={100}
        step={1}
        value={batch}
        onChange={setBatch}
      />
      <Slider
        id={`${id}-view`}
        label="Projection angle"
        min={0}
        max={90}
        step={1}
        value={view}
        onChange={setView}
      />
    </ShaderPlayground>
  );
}
