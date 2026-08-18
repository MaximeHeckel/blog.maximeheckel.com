const PostprocessingCode = `import {
  Fn,
  abs,
  distance,
  dot,
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
  segmentType,
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

  const straightSegmentPoint = Fn(([point, start, end]) => {
    const segment = end.sub(start);
    const projection = dot(point.sub(start), segment)
      .div(max(dot(segment, segment), 0.0001))
      .clamp(0.0, 1.0);

    return start.add(segment.mul(projection));
  });

  const curvedSegmentPoint = Fn(([point, start, end]) => {
    const segment = end.sub(start);
    const projection = dot(point.sub(start), segment)
      .div(max(dot(segment, segment), 0.0001))
      .clamp(0.0, 1.0);
    const segmentLength = distance(start, end);
    const direction = segment.div(max(segmentLength, 0.0001));
    const normal = vec2(direction.y.negate(), direction.x);
    const curveAmount = segmentLength.mul(0.2);
    const controlPoint1 = start
      .add(segment.mul(0.33))
      .add(normal.mul(curveAmount));
    const controlPoint2 = start
      .add(segment.mul(0.67))
      .sub(normal.mul(curveAmount));
    const t = projection;
    const oneMinusT = t.oneMinus();

    return start
      .mul(oneMinusT.mul(oneMinusT).mul(oneMinusT))
      .add(controlPoint1.mul(3.0).mul(oneMinusT).mul(oneMinusT).mul(t))
      .add(controlPoint2.mul(3.0).mul(oneMinusT).mul(t).mul(t))
      .add(end.mul(t.mul(t).mul(t)));
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
    const lineMask = float(0.0).toVar();

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

      const nextState = resources.blobStateBuffer.element(
        (i + 1) % maxBlobs,
      );
      const nextActive = nextState.w.greaterThan(0.04).toFloat();
      const nextCenter = vec2(nextState.x.mul(targetAspect), nextState.y);
      const straightPoint = straightSegmentPoint(
        drawUv,
        center,
        nextCenter,
      );
      const curvedPoint = curvedSegmentPoint(drawUv, center, nextCenter);
      const segmentPoint = mix(straightPoint, curvedPoint, segmentType);
      const line = smoothstep(
        0.0,
        0.002,
        distance(drawUv, segmentPoint),
      )
        .oneMinus()
        .mul(active)
        .mul(nextActive);

      boxMask.assign(max(boxMask, box));
      lineMask.assign(max(lineMask, line));
    }

    color.assign(mix(color, vec3(1.0), max(boxMask, lineMask)));

    return vec4(color, 1.0);
  })();
};
`;

export default PostprocessingCode;
