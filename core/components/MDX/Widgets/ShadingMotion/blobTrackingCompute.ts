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
  maxBlobs,
  resources,
  shaderUniforms,
  videoTexture,
  videoUvScaleX,
  videoUvScaleY,
}) => {
  const computeMotion = wgslFn(\`\
    fn computeMotion(
      sceneTexture: texture_2d<f32>,
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
      let sceneDimensions = textureDimensions(sceneTexture);
      let outputUv = (vec2f(coord) + vec2f(0.5)) / vec2f(dimensions);
      let coverUv = (outputUv - vec2f(0.5)) * videoUvScale + vec2f(0.5);
      let sceneUv = vec2f(coverUv.x, 1.0 - coverUv.y);
      let sceneCoord = clamp(
        vec2i(sceneUv * vec2f(sceneDimensions)),
        vec2i(0),
        vec2i(sceneDimensions) - vec2i(1)
      );
      let sceneColor = textureLoad(sceneTexture, sceneCoord, 0).rgb;
      let currentLuminance = dot(sceneColor, vec3f(0.299, 0.587, 0.114));
      let previousState = textureLoad(stateReadTexture, vec2i(coord), 0);
      let difference = abs(currentLuminance - previousState.r);
      var motion = 0.0;

      if (hasPreviousFrame) {
        motion = smoothstep(
          motionThreshold,
          motionThreshold * 20.0,
          difference
        ) * 20.0;
      }

      let trail = max(previousState.a * trailDecay, motion);

      // R: current luminance, G: current motion, A: motion trail.
      textureStore(
        stateWriteTexture,
        vec2i(coord),
        vec4f(currentLuminance, motion, 0.0, trail)
      );
    }
  \`);

  const computeBlobs = wgslFn(\`\
    fn computeBlobs(
      stateTexture: texture_2d<f32>,
      blobStateBuffer: ptr<storage, array<vec4f>, read_write>,
      index: u32
    ) -> void {
      if (index >= \${maxBlobs}u) {
        return;
      }

      let dimensions = textureDimensions(stateTexture);
      let previousState = blobStateBuffer[index];
      let wasActive = previousState.w > 0.03;
      let slot = f32(index);
      let seed = vec2f(
        fract(slot * 0.61803398875 + 0.13),
        fract(slot * 0.38196601125 + 0.31)
      );
      let probeCenter = select(seed, previousState.xy, wasActive);
      let searchRadius = select(0.45, 0.28, wasActive);
      var weightSum = 0.0;
      var weightedCenter = vec2f(0.0);
      var weightedSecondMoment = vec2f(0.0);
      var strongestMotion = 0.0;

      for (var sampleIndex = 0u; sampleIndex < 25u; sampleIndex++) {
        let sx = f32(sampleIndex % 5u) / 4.0 - 0.5;
        let sy = f32(sampleIndex / 5u) / 4.0 - 0.5;
        let sampleUv = clamp(
          probeCenter + vec2f(sx, sy) * searchRadius,
          vec2f(0.0),
          vec2f(1.0)
        );
        let sampleCoord = clamp(
          vec2i(sampleUv * vec2f(dimensions)),
          vec2i(0),
          vec2i(dimensions) - vec2i(1)
        );
        let motionSample = textureLoad(stateTexture, sampleCoord, 0);
        let trackedMotion = motionSample.g * 0.8 + motionSample.a * 0.2;
        let falloff = max(0.0, 1.0 - length(vec2f(sx, sy)) * 1.25);
        var exclusion = 1.0;

        for (var otherIndex = 0u; otherIndex < \${maxBlobs}u; otherIndex++) {
          if (otherIndex >= index) {
            break;
          }

          let otherState = blobStateBuffer[otherIndex];
          if (otherState.w > 0.04) {
            exclusion *= smoothstep(
              0.035,
              0.13,
              length(sampleUv - otherState.xy)
            );
          }
        }

        let weight = trackedMotion * falloff * exclusion;
        weightSum += weight;
        weightedCenter += sampleUv * weight;
        weightedSecondMoment += sampleUv * sampleUv * weight;
        strongestMotion = max(strongestMotion, trackedMotion);
      }

      var nextState = vec4f(0.0);

      if (strongestMotion > 0.05 && weightSum > 0.004) {
        let detectedCenter = weightedCenter / max(weightSum, 0.0001);
        let variance = max(
          weightedSecondMoment / max(weightSum, 0.0001)
            - detectedCenter * detectedCenter,
          vec2f(0.0)
        );
        let detectedSize = clamp(
          sqrt(max(variance.x, variance.y)) * 0.85,
          0.02,
          0.82
        );
        let center = select(
          detectedCenter,
          mix(previousState.xy, detectedCenter, 0.25),
          wasActive
        );
        let size = select(
          detectedSize,
          mix(previousState.z, detectedSize, 0.5),
          wasActive
        );
        let confidence = clamp(
          max(previousState.w * 0.75, strongestMotion * 2.0),
          0.0,
          1.0
        );

        nextState = vec4f(center, size, confidence);
      } else if (wasActive) {
        let confidence = previousState.w * 0.9;

        if (confidence > 0.03) {
          nextState = vec4f(previousState.xyz, confidence);
        }
      }

      blobStateBuffer[index] = nextState;
    }
  \`);

  const createComputeMotionNode = (readIndex, writeIndex) =>
    computeMotion({
      sceneTexture: texture(videoTexture),
      stateReadTexture: texture(resources.stateTextures[readIndex]),
      stateWriteTexture: storageTexture(
        resources.stateTextures[writeIndex],
      ).toWriteOnly(),
      hasPreviousFrame: shaderUniforms.hasPreviousFrame,
      motionThreshold: shaderUniforms.motionThreshold,
      trailDecay: shaderUniforms.trailDecay,
      videoUvScale: vec2(videoUvScaleX, videoUvScaleY),
      index: instanceIndex,
    }).compute(detectionWidth * detectionHeight, [8]);

  const createComputeBlobNode = (stateIndex) =>
    computeBlobs({
      stateTexture: texture(resources.stateTextures[stateIndex]),
      blobStateBuffer: resources.blobStateBuffer,
      index: instanceIndex,
    }).compute(maxBlobs, [1]);

  return {
    computeBlobNodes: [createComputeBlobNode(1), createComputeBlobNode(0)],
    computeMotionNodes: [
      createComputeMotionNode(0, 1),
      createComputeMotionNode(1, 0),
    ],
  };
};
`;

export default ComputeCode;
