import { Box, Icon, IconButton, Tooltip } from '@maximeheckel/design-system';
import { useId, useState } from 'react';

import { Select } from '@core/components/Select';
import { Slider } from '@core/components/Slider';

import { ShaderPlayground } from '../ShaderPlayground';

const fragment = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform sampler2D uBlueNoise;
uniform vec2 uBlueNoiseSize;
uniform highp sampler2D uPreviousFrame;
uniform bool uFeedbackPass;
uniform float uLimit;
uniform float uEpoch;
uniform float uGridSize;

float sampleBlueNoise(ivec2 cell,int frame) {
  // GI5: translate the spatial blue-noise tile each frame (dimension zero).
  ivec2 size=ivec2(uBlueNoiseSize);
  ivec2 coord=(cell+frame*ivec2(59,83))%size;
  // ShaderCanvas flips image uploads; undo that for the original data texels.
  coord.y=size.y-1-coord.y;
  float value=texelFetch(uBlueNoise,coord,0).r;
  return (value*255.0+0.5)/256.0;
}
vec3 linearColor(vec3 color) {
  return mix(pow((color+0.055)/1.055,vec3(2.4)),color/12.92,
    lessThanEqual(color,vec3(0.04045)));
}
vec3 displayColor(vec3 color) {
  color=clamp(color,0.0,1.0);
  return mix(1.055*pow(color,vec3(1.0/2.4))-0.055,12.92*color,
    lessThanEqual(color,vec3(0.0031308)));
}
void main() {
  // Do not accumulate the texture loader's placeholder image.
  if(any(lessThan(uTextureSize,vec2(2))) || any(lessThan(uBlueNoiseSize,vec2(2)))) {
    fragColor=uFeedbackPass?vec4(0):vec4(0.04,0.05,0.06,1);
    return;
  }
  ivec2 pixel=ivec2(gl_FragCoord.xy);
  // Share one image sample and hit/miss decision across each visible block.
  // Fixed logical resolution keeps the noise readable on high-DPI screens.
  vec2 gridSize=uGridSize>0.0?uGridSize*uResolution/min(uResolution.x,uResolution.y):uResolution;
  ivec2 cell=ivec2(floor(vUv*gridSize));
  vec2 sampleUv=(vec2(cell)+0.5)/gridSize;
  float canvasAspect=uResolution.x/uResolution.y;
  float textureAspect=uTextureSize.x/uTextureSize.y;
  vec2 scale=textureAspect>canvasAspect?vec2(canvasAspect/textureAspect,1):vec2(1,textureAspect/canvasAspect);
  vec3 reference=linearColor(texture(uTexture,(sampleUv-0.5)*scale+0.5).rgb);
  // One reserved texel stores reset generation and accumulated frame count.
  vec4 metadata=texelFetch(uPreviousFrame,ivec2(0),0);
  bool reset=abs(metadata.r-uEpoch)>0.1;
  float count=reset?0.0:metadata.g;
  bool collecting=count<uLimit;
  float nextCount=collecting?count+1.0:count;
  if(pixel==ivec2(0)) {
    fragColor=uFeedbackPass?vec4(uEpoch,nextCount,0,0):vec4(displayColor(reference),1);
    return;
  }
  vec3 average=reset?vec3(0):texelFetch(uPreviousFrame,pixel,0).rgb;
  if(collecting) {
    // Synthetic hit/miss samples: misses return black, hits retain image color.
    // Inverse-probability weighting keeps the expected value equal to reference.
    // Keep HDR hits unclipped in float history; only clamp for display.
    const float hitProbability=0.25;
    vec3 measurement=sampleBlueNoise(cell,int(count))<hitProbability?reference/hitProbability:vec3(0);
    average+=(measurement-average)/nextCount;
  }
  // Both passes read the old texture and compute the same next average, so
  // presentation shows the freshly accumulated frame without a one-frame delay.
  fragColor=uFeedbackPass?vec4(average,nextCount):vec4(displayColor(average),1);
}
`;

export default function ImageAccumulation() {
  const id = useId();
  const [limit, setLimit] = useState(1);
  const [epoch, setEpoch] = useState(1);
  const [gridSize, setGridSize] = useState('24');

  return (
    <ShaderPlayground
      fragmentShader={fragment}
      floatingPointFeedback
      showCode={false}
      uniforms={{
        uTexture:
          'https://cdn.maximeheckel.com/images/backgrounds/flowers.webp',
        uBlueNoise: 'https://cdn.maximeheckel.com/noises/blue-noise.png',
        uLimit: limit,
        uEpoch: epoch,
        uGridSize: Number(gridSize),
      }}
    >
      <Slider
        id={`${id}-history`}
        label="History limit"
        min={1}
        max={50}
        step={1}
        value={limit}
        onChange={(value) => {
          setLimit(value);
          setEpoch((previous) => previous + 1);
        }}
      />
      <Select
        id={`${id}-pixel-size`}
        label="Pixel size"
        size="md"
        value={gridSize}
        items={[
          { label: 'Original', value: '0' },
          { label: 'Small', value: '96' },
          { label: 'Medium', value: '48' },
          { label: 'Large', value: '24' },
        ]}
        onChange={(value) => {
          if (value === null) return;

          setGridSize(value);
          setEpoch((previous) => previous + 1);
        }}
      />
      <Box css={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
        <Tooltip id={`${id}-restart-tip`} content="Restart accumulation">
          <IconButton
            rounded
            size="small"
            variant="tertiary"
            type="button"
            aria-label="Restart accumulation"
            aria-describedby={`${id}-restart-tip`}
            onClick={() => setEpoch((previous) => previous + 1)}
          >
            <Icon.Repeat aria-hidden="true" />
          </IconButton>
        </Tooltip>
      </Box>
    </ShaderPlayground>
  );
}
