uniform sampler2D positions;
uniform float pointSize;
varying float vDistance;
varying vec3 vPosition;

void main() {
    // Get the position from the texture
    vec3 pos = texture2D(positions, position.xy).xyz;
    
    // Transform the position to view space
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Project the position to screen space
    gl_Position = projectionMatrix * mvPosition;

    vDistance = length(mvPosition.xyz);
    vPosition = pos;

    // Calculate point size based on multiple factors:
    // - Checks if position.x is within FOV range using step function
    // - Multiplies by distance from focus and blur factor
    //gl_PointSize = clamp((step(0.95 - (1.0 / (uFov + 1e-6)), position.x)) * vDistance * uBlur , pointSize, 5.0);
    gl_PointSize = pointSize * 1.5 / length(mvPosition.xyz);
}