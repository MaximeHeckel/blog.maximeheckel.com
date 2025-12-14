uniform sampler2D positions;
uniform float pointSize;
varying float vDistance;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    // Get the position from the texture
    vec3 pos = texture2D(positions, position.xy).xyz;
    
    // Transform the position to view space
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Project the position to screen space
    gl_Position = projectionMatrix * mvPosition;

    vDistance = length(mvPosition.xyz);
    vPosition = pos;
    vUv = uv;

    gl_PointSize = pointSize * 3.0 / length(mvPosition.xyz);
}