const ComputeCode = `import {
  instanceIndex,
  storageTexture,
  texture,
  wgslFn,
} from 'three/tsl';

export const createComputeNodes = ({
  detectionHeight,
  detectionWidth,
  resources,
  shaderUniforms,
}) => {
  const computeMotion = wgslFn(\`\
    fn computeMotion(
      sceneTexture: texture_2d<f32>,
      stateReadTexture: texture_2d<f32>,
      stateWriteTexture: texture_storage_2d<rgba8unorm, write>,
      hasPreviousFrame: bool,
      motionThreshold: f32,
      trailDecay: f32,
      index: u32
    ) -> void {
      let dimensions = textureDimensions(stateWriteTexture);
      let pixelCount = dimensions.x * dimensions.y;

      if (index >= pixelCount) {
        return;
      }

      let coord = vec2u(index % dimensions.x, index / dimensions.x);
      let sceneDimensions = textureDimensions(sceneTexture);
      let sceneUv = (vec2f(coord) + vec2f(0.5)) / vec2f(dimensions);
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
          motionThreshold * 10.0,
          difference
        ) * 10.0;
      }

      let leftCoord = clamp(
        vec2i(coord) - vec2i(1, 0),
        vec2i(0),
        vec2i(dimensions) - vec2i(1)
      );
      let rightCoord = clamp(
        vec2i(coord) + vec2i(1, 0),
        vec2i(0),
        vec2i(dimensions) - vec2i(1)
      );
      let upCoord = clamp(
        vec2i(coord) - vec2i(0, 1),
        vec2i(0),
        vec2i(dimensions) - vec2i(1)
      );
      let downCoord = clamp(
        vec2i(coord) + vec2i(0, 1),
        vec2i(0),
        vec2i(dimensions) - vec2i(1)
      );

      let leftMatch = abs(
        currentLuminance - textureLoad(stateReadTexture, leftCoord, 0).r
      );
      let rightMatch = abs(
        currentLuminance - textureLoad(stateReadTexture, rightCoord, 0).r
      );
      let upMatch = abs(
        currentLuminance - textureLoad(stateReadTexture, upCoord, 0).r
      );
      let downMatch = abs(
        currentLuminance - textureLoad(stateReadTexture, downCoord, 0).r
      );
      let rawFlow = vec2f(
        rightMatch - leftMatch,
        downMatch - upMatch
      );
      let flowLength = length(rawFlow);
      var flowDirection = vec2f(0.0);

      if (flowLength > 0.001 && motion > 0.0) {
        flowDirection = rawFlow / flowLength;
      }

      let previousFlow = previousState.gb * 2.0 - 1.0;
      let trailFlow = mix(
        previousFlow * trailDecay,
        flowDirection,
        clamp(motion, 0.0, 1.0)
      );
      let encodedTrailFlow = trailFlow * 0.5 + 0.5;
      let trailAlpha = max(previousState.a * trailDecay, motion);

      // R: luminance, GB: encoded flow direction, A: motion trail.
      textureStore(
        stateWriteTexture,
        vec2i(coord),
        vec4f(currentLuminance, encodedTrailFlow, trailAlpha)
      );
    }
  \`);

  const createComputeNode = (readIndex, writeIndex) =>
    computeMotion({
      sceneTexture: texture(resources.sceneTarget.texture),
      stateReadTexture: texture(resources.stateTextures[readIndex]),
      stateWriteTexture: storageTexture(
        resources.stateTextures[writeIndex],
      ).toWriteOnly(),
      hasPreviousFrame: shaderUniforms.hasPreviousFrame,
      motionThreshold: shaderUniforms.motionThreshold,
      trailDecay: shaderUniforms.trailDecay,
      index: instanceIndex,
    }).compute(detectionWidth * detectionHeight, [8]);

  return [createComputeNode(0, 1), createComputeNode(1, 0)];
};
`;

export default ComputeCode;
