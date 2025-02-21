uniform sampler2D positions;
uniform float pointSize;
uniform float uTime;
uniform float uFocus;
uniform float uFov;
uniform float uBlur;
varying float vDistance;

void main() {
  vec3 pos = texture2D(positions, position.xy).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mvPosition;

  vDistance = abs(uFocus - -mvPosition.z);

  gl_PointSize = (step(1.0 - (1.0 / uFov), position.x)) * vDistance * uBlur;
}