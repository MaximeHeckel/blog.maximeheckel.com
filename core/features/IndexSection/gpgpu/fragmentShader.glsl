varying float vDistance;
varying vec2 vUv;


void main() {
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float dist = length(cxy);

  if (dist > 0.8) discard;


  float falloff = dist;
  float intensity =  falloff * 1.65;


  gl_FragColor = vec4(vec3(1.0), (1.0 - clamp(vDistance, 0.0, 0.75) * intensity));
}