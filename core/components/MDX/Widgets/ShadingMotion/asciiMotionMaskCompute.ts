const ComputeCode = `import {
  instanceIndex,
  storageTexture,
  texture,
  vec2,
  wgslFn,
} from 'three/tsl';

export const createComputeNodes = ({
  detectionHeight,
  detectionWidth,
  resources,
  shaderUniforms,
  videoTexture,
  videoUvScaleX,
  videoUvScaleY,
}) => {
  const computeMotionMask = wgslFn(\`\\
    fn computeMotionMask(
      videoTexture: texture_2d<f32>,
      stateReadTexture: texture_2d<f32>,
      stateWriteTexture: texture_storage_2d<rgba8unorm, write>,
      hasPreviousFrame: bool,
      motionThreshold: f32,
      trailDecay: f32,
      videoUvScale: vec2f,
      index: u32
    ) -> void {
      let dimensions = textureDimensions(stateWriteTexture);
      let pixelCount = dimensions.x * dimensions.y;

      if (index >= pixelCount) {
        return;
      }

      let coord = vec2u(index % dimensions.x, index / dimensions.x);
      let outputUv = (vec2f(coord) + vec2f(0.5)) / vec2f(dimensions);
      let coverUv = (outputUv - vec2f(0.5)) * videoUvScale + vec2f(0.5);
      let videoUv = vec2f(coverUv.x, 1.0 - coverUv.y);
      let videoDimensions = textureDimensions(videoTexture);
      let videoCoord = clamp(
        vec2i(videoUv * vec2f(videoDimensions)),
        vec2i(0),
        vec2i(videoDimensions) - vec2i(1)
      );
      let currentColor = textureLoad(videoTexture, videoCoord, 0).rgb;
      let currentLuminance = dot(
        currentColor,
        vec3f(0.299, 0.587, 0.114)
      );
      let previousState = textureLoad(stateReadTexture, vec2i(coord), 0);
      let difference = abs(currentLuminance - previousState.r);
      var motionAmount = 0.0;

      if (hasPreviousFrame) {
        let thresholdedMotion = smoothstep(
          motionThreshold,
          motionThreshold * 4.0,
          difference
        );

        motionAmount = pow(thresholdedMotion, 0.5);
      }

      let decayedTrail = max(previousState.g * trailDecay - 0.025, 0.0);
      let motionTrail = max(decayedTrail, motionAmount);

      // R stores current luminance. G stores the persistent motion mask.
      textureStore(
        stateWriteTexture,
        vec2i(coord),
        vec4f(currentLuminance, motionTrail, 0.0, 1.0)
      );
    }
  \`);

  const createComputeNode = (readIndex, writeIndex) =>
    computeMotionMask({
      hasPreviousFrame: shaderUniforms.hasPreviousFrame,
      index: instanceIndex,
      motionThreshold: shaderUniforms.motionThreshold,
      stateReadTexture: texture(resources.stateTextures[readIndex]),
      stateWriteTexture: storageTexture(
        resources.stateTextures[writeIndex],
      ).toWriteOnly(),
      trailDecay: shaderUniforms.trailDecay,
      videoTexture: texture(videoTexture),
      videoUvScale: vec2(videoUvScaleX, videoUvScaleY),
    }).compute(detectionWidth * detectionHeight, [8]);

  return [createComputeNode(0, 1), createComputeNode(1, 0)];
};
`;

export default ComputeCode;
