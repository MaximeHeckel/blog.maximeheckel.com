import {
  Box,
  Icon,
  IconButton,
  Tooltip,
  Text,
  Flex,
} from '@maximeheckel/design-system';
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

const float TEXTURE_ASPECT_RATIO = 1.3;

mat2 rot(float deg) {
  float a = radians(deg);
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

vec2 toGridUV(vec2 uv, float angleDeg) {
  return rot(angleDeg) * (uv * uResolution) / uPixelSize;
}

vec2 getCellCenterUV(vec2 uv, float angleDeg) {
  vec2 gridUV = toGridUV(uv, angleDeg);
  vec2 cellCenter = floor(gridUV) + 0.5;
  vec2 centerScreen = rot(-angleDeg) * cellCenter * uPixelSize;
  return centerScreen / uResolution;
}

float halftoneDot(vec2 uv, float angleDeg, float coverage) {
  vec2 gridUV = toGridUV(uv, angleDeg);
  vec2 gv = fract(gridUV) - 0.5;
  float r = uDotSize * sqrt(clamp(coverage, 0.0, 1.0));
  float aa = fwidth(length(gv));
  float d = length(gv);
  return 1.0 - smoothstep(r - aa, r + aa, d);
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

void main() {
  vec2 uv = vUv;

  // Sample texture at each channel's rotated cell center
  // This ensures consistent color within each rotated halftone cell
  vec2 uvC = getCellCenterUV(uv, uAngleC);
  vec2 uvM = getCellCenterUV(uv, uAngleM);
  vec2 uvY = getCellCenterUV(uv, uAngleY);
  vec2 uvK = getCellCenterUV(uv, uAngleK);

  vec4 cmykC = RGBtoCMYK(texture(uTexture, uvC * vec2(1.0, TEXTURE_ASPECT_RATIO)).rgb);
  vec4 cmykM = RGBtoCMYK(texture(uTexture, uvM * vec2(1.0, TEXTURE_ASPECT_RATIO)).rgb);
  vec4 cmykY = RGBtoCMYK(texture(uTexture, uvY * vec2(1.0, TEXTURE_ASPECT_RATIO)).rgb);
  vec4 cmykK = RGBtoCMYK(texture(uTexture, uvK * vec2(1.0, TEXTURE_ASPECT_RATIO)).rgb);

  float dotC = halftoneDot(uv, uAngleC, cmykC.x);
  float dotM = halftoneDot(uv, uAngleM, cmykM.y);
  float dotY = halftoneDot(uv, uAngleY, cmykY.z);
  float dotK = halftoneDot(uv, uAngleK, cmykK.w);

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
        uDotSize: 0.65,
        uAngleC: angleC,
        uAngleM: angleM,
        uAngleY: angleY,
        uAngleK: angleK,
        uTexture: '/static/backgrounds/flowers.webp',
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
      <Box
        as="hr"
        css={{
          width: '100%',
          height: '1px',
          border: 'none',
          backgroundColor: 'var(--border-color)',
        }}
      />
      <Flex
        alignItems="center"
        css={{ width: '100%' }}
        gap="2"
        justifyContent="space-between"
      >
        <Text size="2" weight="4" variant="tertiary">
          Angles
        </Text>
        <Tooltip content="Reset Angles">
          <IconButton
            variant="tertiary"
            size="small"
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
      </Flex>
      <Slider
        id="angleC"
        label="Cyan"
        min={0}
        max={90}
        step={1}
        value={angleC}
        onChange={setAngleC}
      />
      <Slider
        id="angleM"
        label="Magenta"
        min={0}
        max={90}
        step={1}
        value={angleM}
        onChange={setAngleM}
      />
      <Slider
        id="angleY"
        label="Yellow"
        min={0}
        max={90}
        step={1}
        value={angleY}
        onChange={setAngleY}
      />
      <Slider
        id="angleK"
        label="Black"
        min={0}
        max={90}
        step={1}
        value={angleK}
        onChange={setAngleK}
      />
    </ShaderPlayground>
  );
};
