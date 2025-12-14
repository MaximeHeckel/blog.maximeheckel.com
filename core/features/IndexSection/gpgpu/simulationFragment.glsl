precision highp float;

uniform sampler2D positions;
uniform float uTime;
uniform float uSize;
varying vec2 vUv;

const float PI = 3.141592653589793;

#pragma glslify: curl = require(glsl-curl-noise2)

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float particleIndex = floor(vUv.x * uSize) + floor(vUv.y * uSize) * uSize;
  float totalParticles = uSize * uSize;
  
  float t_base = particleIndex / totalParticles * 2.0 * PI;
  
  float t = t_base + uTime * 2.5;  
  

  float sinT = sin(t);
  float cosT = cos(t);
  float scale = 2.5;
  
  float x = (cosT / (1.0 + sinT * sinT)) * scale;
  float y = (sinT * cosT / (1.0 + sinT * sinT)) * scale;
  float z = (0.5 * sinT) * scale;
  
  vec3 pos = vec3(x, y, z);
  

  float randomness = 0.5;
  pos.x += (random(vUv) - 0.5) * randomness;
  pos.y += (random(vUv + 1.0) - 0.5) * randomness;
  pos.z += (random(vUv + 2.0) - 0.5) * randomness;
  

  pos += curl(pos * 0.05 + uTime * 0.1) * 0.25;
  
  gl_FragColor = vec4(pos, 1.0);
}