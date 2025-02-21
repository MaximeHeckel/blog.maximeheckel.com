varying float vDistance;



void main() {
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  if (dot(cxy, cxy) > 0.7) discard;
  gl_FragColor = vec4(vec3(1.0), (1.0 - clamp(vDistance, 0.0, 0.85)));
}