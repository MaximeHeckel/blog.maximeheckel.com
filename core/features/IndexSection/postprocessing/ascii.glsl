uniform float pixelSize;

vec3 saturateColor(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

const float COLOR_NUM = 32.0;
const float distortionScale = 0.025;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
   
  vec4 color = texture2D(inputBuffer, uvPixel);

  color.r = floor(color.r * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
  color.g = floor(color.g * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
  color.b = floor(color.b * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);

  vec4 ogColor = vec4(0.0);
  float ogColorR = texture2D(inputBuffer, uv + vec2(0.01 * distortionScale, 0.0)).r;
  float ogColorG = texture2D(inputBuffer, uv + vec2(0.0)).g;
  float ogColorB = texture2D(inputBuffer, uv - vec2(0.02 * distortionScale, 0.0)).b;

  ogColor = vec4(ogColorR, ogColorG, ogColorB, 1.0);


  float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

  vec2 cellUV = fract(uv / normalizedPixelSize);
  float radius = luma;

  vec2 circleCenter = vec2(0.5, 0.5);
  float distanceFromCenter = distance(cellUV, circleCenter);


  float circleMask = smoothstep(radius, radius - 0.001, distanceFromCenter);
  vec4 asciiColor =  vec4(circleMask, circleMask, circleMask, 1.0) * luma;
  
  ogColor *= 1.5;
  ogColor.rgb = saturateColor(ogColor.rgb, 1.35);
    

  float transition =  smoothstep(0.0, 0.35, uv.y - pow(uv.x, 2.0));
  
  outputColor = mix(asciiColor, vec4(ogColor.rgb, 1.0), transition);
  outputColor.a = 1.0;
  // outputColor = asciiColor;

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
