precision mediump float;

uniform float uTime;
uniform sampler2D positions;
varying vec2 vUv;

#pragma glslify: noise = require(glsl-noise/classic/3d.glsl)   

// vec3 lemniscate(vec3 pos, float t) {
//     // Base lemniscate curve
//     float x = cos(t) / (1.0 + sin(t) * sin(t));
//     float y = sin(2.0 * t) / 2.0;
//     float z = sin(t) * 0.5;
//     vec3 basePos = vec3(x, y, z) * 2.0;
    
//     // Use vUv for consistent random offset per particle
//     float randomOffset = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
//     float randomOffset2 = fract(sin(dot(vUv, vec2(39.346, 11.135))) * 43758.5453);
//     float randomOffset3 = fract(sin(dot(vUv, vec2(83.155, 37.719))) * 43758.5453);
    
//     float spread = 0.5;
//     vec3 offset = vec3(
//         (randomOffset - 0.5) * spread,
//         (randomOffset2 - 0.5) * spread,
//         (randomOffset3 - 0.5) * spread
//     );
    
//     return basePos + offset;
// }

const float PI = 3.141592653589793;

/// A small helper function for stable pseudo-randomness based on UV.
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float dt = 0.001 + rand(vUv) * 0.6;
  
  // Scale factor for the figure-8.
  float scale = 3.75; // Increased from 3.75 to make pattern larger
  
  // 1) Read current position (x, y, z) from the texture.
  vec3 pos = texture2D(positions, vUv).xyz;
  
  // 2) To recover t correctly, first "unscale" the position.
  vec3 posUnscaled = pos / scale;
  
  // Use the unscaled position to recover t:
  // For z: z = 0.5 * sin(t) => sin(t) = 2 * z.
  float s = clamp(2.0 * posUnscaled.z, -1.0, 1.0);
  // For x: x = cos(t) / (1 + sin^2(t)) => cos(t) = x * (1 + (2z)^2)
  float c = posUnscaled.x * (1.0 + 4.0 * posUnscaled.z * posUnscaled.z);
  
  float t = atan(s, c); // Returns value in [-PI, PI]
  if (t < 0.0) {
    t += 2.0 * PI;
  }
  
  // 3) Advance t by dt.
  t = mod(t + dt, 2.0 * PI);
  
  // 4) Compute the new "center" on the figure-8 at t.
  float sinT = sin(t);
  float cosT = cos(t);
  
  float newX = cosT / (1.0 + sinT * sinT);
  float newY = 0.3 * sin(2.0 * t) ;
  float newZ = 0.5 * sinT;
  
  // Compute center using the original (unscaled) equations, then scale.
  vec3 center = scale * vec3(newX, newY, newZ);
  
  // 5) Pull the particle slightly toward the new center.
  float pullStrength = 0.12;
  pos = mix(pos, center, pullStrength);
  
  // 6) Add a small, stable random offset for "cloudiness."
  float r1 = rand(vUv * 123.45);
  float r2 = rand(vUv * 543.21);
  float angle  = r1 * 5.0 * PI;
  float radius = 0.1 * r2;  // Increased from 0.03 to 0.3 for more spread
  float offsetX = cos(angle) * radius;
  float offsetY = sin(angle) * radius;
  
  float r3 = rand(vUv * 999.99) - 0.5;
  float offsetZ = r3 * 0.03; // Increased from 0.03 to 0.3
  pos += vec3(offsetX, offsetY, offsetZ);
  
  // 7) Output the updated position.
  gl_FragColor = vec4(pos, 1.0);
}