const PostprocessingCode = `import {
  Fn,
  dot,
  float,
  mix,
  pow,
  texture,
  uv,
  vec2,
  vec3,
  vec4,
  wgslFn,
} from 'three/tsl';

const ASCII_CHARACTER_COUNT = 11;

export const createOutputNodes = ({
  resources,
  showMotionMask,
  targetAspect,
  videoTexture,
  videoUvScaleX,
  videoUvScaleY,
}) => {
  const asciiRows = 64;
  const asciiColumns = Math.max(1, Math.round(asciiRows * targetAspect));

  const snapAsciiUv = wgslFn(\`\\
    fn snapAsciiUv(inputUv: vec2f) -> vec2f {
      let grid = vec2f(\${asciiColumns}.0, \${asciiRows}.0);

      return (floor(inputUv * grid) + vec2f(0.5)) / grid;
    }
  \`);

  const asciiAtlasMotion = wgslFn(\`\\
    fn asciiAtlasMotion(
      asciiTexture: texture_2d<f32>,
      inputUv: vec2f,
      value: f32
    ) -> f32 {
      let grid = vec2f(\${asciiColumns}.0, \${asciiRows}.0);
      let cellUv = fract(inputUv * grid);
      let characterIndex = clamp(
        floor(clamp(value, 0.0, 1.0) * f32(\${ASCII_CHARACTER_COUNT - 1})),
        0.0,
        f32(\${ASCII_CHARACTER_COUNT - 1})
      );
      let atlasUv = vec2f(
        (characterIndex + cellUv.x) / f32(\${ASCII_CHARACTER_COUNT}),
        1.0 - cellUv.y
      );
      let atlasDimensions = textureDimensions(asciiTexture);
      let atlasCoord = clamp(
        vec2i(atlasUv * vec2f(atlasDimensions)),
        vec2i(0),
        vec2i(atlasDimensions) - vec2i(1)
      );

      return textureLoad(asciiTexture, atlasCoord, 0).r;
    }
  \`);

  const effectColor = pow(vec3(1.0, 0.35, 0.6), vec3(2.2));

  const createOutputNode = (stateIndex) =>
    Fn(() => {
      const screenUv = uv();
      const coverVideoUv = screenUv
        .sub(0.5)
        .mul(vec2(videoUvScaleX, videoUvScaleY))
        .add(0.5);
      const videoUv = vec2(
        coverVideoUv.x,
        float(1.0).sub(coverVideoUv.y),
      );
      const sceneColor = texture(videoTexture, videoUv).rgb;
      const snappedUv = snapAsciiUv({ inputUv: screenUv });
      const motionMask = texture(
        resources.stateTextures[stateIndex],
        snappedUv,
      ).g;

      if (showMotionMask) {
        return vec4(vec3(motionMask), 1.0);
      }

      const asciiPattern = asciiAtlasMotion({
        asciiTexture: texture(resources.asciiTexture),
        inputUv: screenUv,
        value: motionMask,
      });

      const background = sceneColor.mul(0.8);
      const asciiColor = mix(effectColor, vec3(1.0), asciiPattern);
      const stylizedMotion = mix(background, asciiColor, motionMask);

      return vec4(stylizedMotion, 1.0);
    })();

  return [createOutputNode(1), createOutputNode(0)];
};
`;

export default PostprocessingCode;
