precision highp float;

uniform sampler2D positions;
uniform float uTime;
varying vec2 vUv;

const float PI = 3.141592653589793;

#pragma glslify: curl = require(glsl-curl-noise2)

/// A small helper function for stable pseudo-randomness based on UV.
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Adjust dt to ensure continuous movement
  float dt = 0.2; // Reduced max random component for more consistent speed
  
  // 1) Read current position (x, y, z) from the texture.
  vec3 pos = texture2D(positions, vUv).xyz;
  
  // 2) To recover t correctly, first "unscale" the position.
  // Use the unscaled position to recover t:
  // For z: z = 0.5 * sin(t) => sin(t) = 2 * z.
  float s = clamp(2.0 * pos.z, -1.0, 1.0);
  // For x: x = cos(t) / (1 + sin^2(t)) => cos(t) = x * (1 + (2z)^2)
  float c = clamp(pos.x * (1.0 + 4.0 * pos.z * pos.z), -1.0, 1.0);
  
  float t = atan(s, c);

  
  
  // 3) Advance t with constant dt
  t = mod(t + dt, 2.0 * PI);
  
  // 4) Compute the new "center" on the figure-8 at t.
  float sinT = sin(t);
  float cosT = cos(t);
  
  float newX = cosT / (1.0 + sinT * sinT);
  float newY = sinT * cosT / (1.0 + sinT * sinT);
  float newZ = 0.5 * sinT;
  
  // Compute center using the original (unscaled) equations, then scale.
  vec3 center = vec3(newX, newY, newZ);
  
  // 5) Pull the particle slightly toward the new center.
  float pullStrength = 0.22;
  pos = mix(pos, center, pullStrength);
  
  // 6) Add a small, stable random offset for "cloudiness."
  float r1 = rand(vUv * 123.45);
  float r2 = rand(vUv * 543.21);
  float angle  = r1 * 2.0 * PI;
  float radius = 0.04 * r2;  // Increased from 0.03 to 0.3 for more spread
  float offsetX = cos(angle) * radius;
  float offsetY = sin(angle) * radius;
  
  float r3 = rand(vUv * 999.99) - 0.5;
  float offsetZ = r3 * 0.02; // Increased from 0.03 to 0.3
  pos += vec3(offsetX, offsetY, offsetZ);
  pos += curl(pos * 0.15 + uTime * 0.1) * 0.02;
  
  // 7) Output the updated position.
  gl_FragColor = vec4(pos, 1.0);
}