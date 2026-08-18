const PostprocessingCode = `import {
  Fn,
  clamp,
  length,
  max,
  mix,
  step,
  texture,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';

const BLUR_SAMPLES = 16;
const EDGE_DILATE = 3.0;
const VELOCITY_VISUALIZATION_SCALE = 32.0;

export const createVelocityMapOutputNode = ({ resources }) =>
  Fn(() => {
    const velocitySample = texture(
      resources.velocityTarget.texture,
    ).sample(uv());
    const encodedVelocity = vec3(
      clamp(
        velocitySample.xy
          .mul(VELOCITY_VISUALIZATION_SCALE)
          .add(0.5),
        0.0,
        1.0,
      ),
      0.5,
    );

    return vec4(
      mix(vec3(0.0), encodedVelocity, velocitySample.a),
      1.0,
    );
  })();

export const createOutputNode = ({
  blurAmount,
  resources,
  sceneTexture,
  targetHeight,
  targetWidth,
}) =>
  Fn(() => {
    const screenUv = uv();
    const velocityTexture = texture(resources.velocityTarget.texture);
    const texelSize = vec2(1 / targetWidth, 1 / targetHeight).mul(
      EDGE_DILATE,
    );
    const bestVelocity = velocityTexture.sample(screenUv).xy.toVar();
    const bestLength = length(bestVelocity).toVar();

    const checkNeighbor = (offsetX, offsetY) => {
      const neighborVelocity = velocityTexture.sample(
        screenUv.add(texelSize.mul(vec2(offsetX, offsetY))),
      ).xy;
      const neighborLength = length(neighborVelocity);
      const useNeighbor = step(bestLength, neighborLength);

      bestVelocity.assign(
        mix(bestVelocity, neighborVelocity, useNeighbor),
      );
      bestLength.assign(max(bestLength, neighborLength));
    };

    checkNeighbor(-1, 0);
    checkNeighbor(1, 0);
    checkNeighbor(0, -1);
    checkNeighbor(0, 1);
    checkNeighbor(-1, -1);
    checkNeighbor(1, -1);
    checkNeighbor(-1, 1);
    checkNeighbor(1, 1);

    const color = vec4(0.0).toVar();

    for (let index = 0; index < BLUR_SAMPLES; index += 1) {
      const phase = index / (BLUR_SAMPLES - 1) - 0.5;
      const sampleUv = screenUv.add(
        bestVelocity.mul(blurAmount).mul(phase),
      );

      color.addAssign(sceneTexture.sample(sampleUv));
    }

    return color.div(BLUR_SAMPLES);
  })();
`;

export default PostprocessingCode;
