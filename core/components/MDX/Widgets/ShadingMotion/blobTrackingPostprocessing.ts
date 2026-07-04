const PostprocessingCode = `import {
  Fn,
  abs,
  float,
  fwidth,
  length,
  max,
  min,
  mix,
  smoothstep,
  texture,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';

export const createOutputNode = ({
  maxBlobs,
  resources,
  targetAspect,
  videoTexture,
  videoUvScaleX,
  videoUvScaleY,
}) => {
  const boxSdf = Fn(([point, halfSize]) => {
    const delta = abs(point).sub(halfSize);

    return length(max(delta, vec2(0.0))).add(
      min(max(delta.x, delta.y), 0.0),
    );
  });

  return Fn(() => {
    const screenUv = uv();
    const coverUv = screenUv
      .sub(0.5)
      .mul(vec2(videoUvScaleX, videoUvScaleY))
      .add(0.5);
    const videoUv = vec2(coverUv.x, float(1.0).sub(coverUv.y));
    const color = texture(videoTexture, videoUv).rgb.toVar();
    const drawUv = vec2(screenUv.x.mul(targetAspect), screenUv.y);
    const boxMask = float(0.0).toVar();

    for (let i = 0; i < maxBlobs; i++) {
      const state = resources.blobStateBuffer.element(i);
      const active = state.w.greaterThan(0.04).toFloat();
      const center = vec2(state.x.mul(targetAspect), state.y);
      const halfSize = vec2(state.z).mul(0.5);
      const distanceToBox = boxSdf(drawUv.sub(center), halfSize);
      const edgeWidth = fwidth(distanceToBox).mul(2.5);
      const box = smoothstep(0.0, edgeWidth, abs(distanceToBox))
        .oneMinus()
        .mul(active);

      boxMask.assign(max(boxMask, box));
    }

    color.assign(mix(color, vec3(1.0), boxMask));

    return vec4(color, 1.0);
  })();
};
`;

export default PostprocessingCode;
