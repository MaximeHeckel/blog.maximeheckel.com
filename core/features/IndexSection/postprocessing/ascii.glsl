uniform float pixelSize;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    // Four corners in 2D of a tile
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    // Smooth Interpolation
    
    
    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0., 1., f);
    
    
    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
    (c - a)* u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}


vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}




 vec3 saturateColor(vec3 rgb, float adjustment) {
        const vec3 W = vec3(0.2125, 0.7154, 0.0721);
        vec3 intensity = vec3(dot(rgb, W));
        return mix(intensity, rgb, adjustment);
      }

const float COLOR_NUM = 16.0;
const float distortionScale = 0.05;

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
  float radius = luma * 0.4;

  vec2 circleCenter = vec2(0.5, 0.5);

  float distanceFromCenter = distance(cellUV, circleCenter);


  float circleMask = smoothstep(radius, radius - 0.001, distanceFromCenter);
  vec4 asciiColor =  vec4(circleMask, circleMask, circleMask, 1.0) * luma * 1.1;
   
  vec2 grainedUv = uv + noise(uv * 400.0);
  float grainSpeed = 25.0;
  float grain = noise(grainedUv + time * random(grainedUv) * grainSpeed);
  // ogColor+= -grain * 0.01;
  ogColor *= 1.4;
  ogColor.rgb = saturateColor(ogColor.rgb, 1.35);
    

  float transition = smoothstep(0.7, 0.0, 0.65 -uv.y + pow(uv.x, 2.0));

  
  outputColor = mix(asciiColor, vec4(ogColor.rgb, 1.0), transition);
  //outputColor = asciiColor;

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
