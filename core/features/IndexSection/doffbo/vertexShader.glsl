uniform sampler2D positions;
uniform float pointSize;
uniform float uTime;
uniform float uFocus;
uniform float uFov;
uniform float uBlur;
varying float vDistance;

void main() {
    // Get the position from the texture
    vec3 pos = texture2D(positions, position.xy).xyz;
    
    // Transform the position to view space
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Project the position to screen space
    gl_Position = projectionMatrix * mvPosition;

    // Calculate distance from focus point
    // Takes absolute difference between focus value and negative Z position
    vDistance = abs(uFocus - -mvPosition.z);

    // Calculate point size based on multiple factors:
    // - Checks if position.x is within FOV range using step function
    // - Multiplies by distance from focus and blur factor
    gl_PointSize = clamp((step(0.95 - (1.0 / (uFov + 1e-6)), position.x)) * vDistance * uBlur , pointSize, 10.0);
    // gl_PointSize = pointSize;
}