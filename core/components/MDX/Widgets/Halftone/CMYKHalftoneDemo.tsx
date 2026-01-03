import { Box, Icon, IconButton, Tooltip } from '@maximeheckel/design-system';
import React, { useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Slider } from '@core/components/Slider';

const CMYK_HALFTONE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uPixelSize;
uniform float uDotSize;
uniform float uAngleC;
uniform float uAngleM;
uniform float uAngleY;
uniform float uAngleK;
uniform sampler2D uTexture;

const float CYAN_STRENGTH    = 0.95;
const float MAGENTA_STRENGTH = 0.95;
const float YELLOW_STRENGTH  = 0.95;
const float BLACK_STRENGTH   = 1.10;

mat2 rot(float deg) {
  float a = radians(deg);
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// Get the texture UV at the center of the rotated halftone cell
vec2 getHalftoneCellTextureUV(vec2 uvScreen, float angleDeg) {
  float effectiveDotDensity = (min(uResolution.x, uResolution.y) / uPixelSize);
  float minRes = min(uResolution.x, uResolution.y);
  float scale = effectiveDotDensity / minRes;

  vec2 uv = uvScreen * scale;

  // Transform to rotated space
  mat2 rotation = rot(angleDeg);
  vec2 rotatedUV = rotation * uv;

  // Find cell center in rotated space
  vec2 cellCenter = floor(rotatedUV) + 0.5;

  // Transform back to screen space
  mat2 invRotation = rot(-angleDeg);
  vec2 screenCenter = invRotation * cellCenter;

  // Convert back to texture UV (0-1 range)
  return screenCenter / scale / uResolution;
}

float halftoneDot(vec2 uvScreen, float angleDeg, float coverage) {
  float effectiveDotDensity = (min(uResolution.x, uResolution.y) / uPixelSize);

  float minRes = min(uResolution.x, uResolution.y);
  float scale = effectiveDotDensity / minRes;
  vec2 uv = uvScreen * scale;

  // Introduce rotation
  uv = rot(angleDeg) * uv;

  vec2 gv = fract(uv) - 0.5;
  float r = uDotSize * sqrt(clamp(coverage, 0.0, 1.0));

  // Analytic AA
  float aa = fwidth(length(gv)) * 1.0;
  float d = length(gv);
  float ink = 1.0 - smoothstep(r - aa, r + aa, d);
  return ink;
}

// Convert RGB to CMYK by MattDSL -> https://gist.github.com/mattdesl/e40d3189717333293813626cbdb2c1d1
vec4 RGBtoCMYK(vec3 rgb) {
  float r = rgb.r;
  float g = rgb.g;
  float b = rgb.b;
  float k = min(1.0 - r, min(1.0 - g, 1.0 - b));
  vec3 cmy = vec3(0.0);
  float invK = 1.0 - k;
  if (invK != 0.0) {
    cmy.x = (1.0 - r - k) / invK;
    cmy.y = (1.0 - g - k) / invK;
    cmy.z = (1.0 - b - k) / invK;
  }
  return clamp(vec4(cmy, k), 0.0, 1.0);
}

// Procedural colorful gradient to demonstrate the effect
vec3 proceduralImage(vec2 uv) {
  // Create a nice colorful gradient with multiple hues
  vec3 col1 = vec3(0.9, 0.2, 0.3);  // Red-ish
  vec3 col2 = vec3(0.2, 0.8, 0.4);  // Green
  vec3 col3 = vec3(0.2, 0.4, 0.9);  // Blue
  vec3 col4 = vec3(0.9, 0.7, 0.1);  // Yellow

  // Four-corner gradient
  vec3 top = mix(col1, col2, uv.x);
  vec3 bottom = mix(col4, col3, uv.x);
  return mix(bottom, top, uv.y);
}

void main() {
  vec2 uvScreen = vUv * uResolution;

  // Sample texture at each channel's rotated cell center
  // This ensures consistent color within each rotated halftone cell
  vec2 uvC = getHalftoneCellTextureUV(uvScreen, uAngleC);
  vec2 uvM = getHalftoneCellTextureUV(uvScreen, uAngleM);
  vec2 uvY = getHalftoneCellTextureUV(uvScreen, uAngleY);
  vec2 uvK = getHalftoneCellTextureUV(uvScreen, uAngleK);

  vec4 cmykC = RGBtoCMYK(texture(uTexture, uvC).rgb);
  vec4 cmykM = RGBtoCMYK(texture(uTexture, uvM).rgb);
  vec4 cmykY = RGBtoCMYK(texture(uTexture, uvY).rgb);
  vec4 cmykK = RGBtoCMYK(texture(uTexture, uvK).rgb);

  float dotC = halftoneDot(uvScreen, uAngleC, cmykC.x);
  float dotM = halftoneDot(uvScreen, uAngleM, cmykM.y);
  float dotY = halftoneDot(uvScreen, uAngleY, cmykY.z);
  float dotK = halftoneDot(uvScreen, uAngleK, cmykK.w);

  vec3 outColor = vec3(1.0);
  outColor.r *= (1.0 - CYAN_STRENGTH * dotC);
  outColor.g *= (1.0 - MAGENTA_STRENGTH * dotM);
  outColor.b *= (1.0 - YELLOW_STRENGTH * dotY);
  outColor *= (1.0 - BLACK_STRENGTH * dotK);

  fragColor = vec4(outColor, 1.0);
}
`;

export const CMYKHalftoneDemo = () => {
  const [pixelSize, setPixelSize] = useState(8.0);
  const [dotSize, setDotSize] = useState(0.65);
  const [angleC, setAngleC] = useState(15.0);
  const [angleM, setAngleM] = useState(75.0);
  const [angleY, setAngleY] = useState(0.0);
  const [angleK, setAngleK] = useState(45.0);

  return (
    <ShaderPlayground
      key={CMYK_HALFTONE_FRAGMENT_SHADER}
      fragmentShader={CMYK_HALFTONE_FRAGMENT_SHADER}
      uniforms={{
        uPixelSize: pixelSize,
        uDotSize: dotSize,
        uAngleC: angleC,
        uAngleM: angleM,
        uAngleY: angleY,
        uAngleK: angleK,
        uTexture: '/static/backgrounds/cliff_walk_at_pourville.jpg',
      }}
      showGrid={false}
      showCode={false}
    >
      <Slider
        id="pixelSize"
        label="Pixel Size"
        min={4}
        max={48}
        step={1}
        value={pixelSize}
        onChange={setPixelSize}
      />
      <Slider
        id="dotSize"
        label="Dot Size"
        min={0}
        max={1}
        step={0.01}
        value={dotSize}
        onChange={setDotSize}
      />
      <Box
        as="hr"
        css={{
          width: '100%',
          height: '1px',
          border: 'none',
          backgroundColor: 'var(--border-color)',
        }}
      />
      <Slider
        id="angleC"
        label="Cyan Angle"
        min={0}
        max={90}
        step={1}
        value={angleC}
        onChange={setAngleC}
        size="sm"
      />
      <Slider
        id="angleM"
        label="Magenta Angle"
        min={0}
        max={90}
        step={1}
        value={angleM}
        onChange={setAngleM}
        size="sm"
      />
      <Slider
        id="angleY"
        label="Yellow Angle"
        min={0}
        max={90}
        step={1}
        value={angleY}
        onChange={setAngleY}
        size="sm"
      />
      <Slider
        id="angleK"
        label="Black Angle"
        min={0}
        max={90}
        step={1}
        value={angleK}
        size="sm"
        onChange={setAngleK}
      />
      <Tooltip content="Reset Angles">
        <IconButton
          variant="secondary"
          onClick={() => {
            setAngleC(15.0);
            setAngleM(75.0);
            setAngleY(0.0);
            setAngleK(45.0);
          }}
        >
          <Icon.Repeat />
        </IconButton>
      </Tooltip>
    </ShaderPlayground>
  );
};
