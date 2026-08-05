const PostprocessingCode = `import {
  Fn,
  If,
  abs,
  add,
  distance,
  dot,
  float,
  fwidth,
  length,
  max,
  min,
  mix,
  mod,
  mul,
  property,
  smoothstep,
  sub,
  texture,
  uv,
  vec2,
  vec3,
  vec4,
  wgslFn,
} from 'three/tsl';

export const createOutputNode = ({
  effectType,
  maxBlobs,
  resources,
  segmentType,
  targetAspect,
  time,
  videoTexture,
  videoUvScaleX,
  videoUvScaleY,
}) => {
  const ditherRows = 400;
  const ditherColumns = Math.max(1, Math.round(ditherRows * targetAspect));

  const boxSdf = Fn(([point, halfSize]) => {
    const delta = abs(point).sub(halfSize);

    return length(max(delta, vec2(0.0))).add(
      min(max(delta.x, delta.y), 0.0),
    );
  });

  const snapDitherUv = wgslFn(\`\
    fn snapDitherUv(uv: vec2f) -> vec2f {
      let resolution = vec2f(\${ditherColumns}.0, \${ditherRows}.0);
      let pixelSize = vec2f(1.0) / resolution;

      return (floor(uv / pixelSize) + vec2f(0.5)) * pixelSize;
    }
  \`);

  const orderedDither = wgslFn(\`\
    fn orderedDither(uv: vec2f, value: f32) -> f32 {
      let resolution = vec2f(\${ditherColumns}.0, \${ditherRows}.0);
      let pixelCoord = vec2i(floor(uv * resolution));
      let bayerX = pixelCoord.x % 4;
      let bayerY = pixelCoord.y % 4;
      let bayerIndex = u32(bayerX + bayerY * 4);
      let bayer = array<f32, 16>(
        0.0, 8.0, 2.0, 10.0,
        12.0, 4.0, 14.0, 6.0,
        3.0, 11.0, 1.0, 9.0,
        15.0, 7.0, 13.0, 5.0
      );
      let threshold = (bayer[bayerIndex] + 2.5) / 16.0;

      return select(0.0, 1.0, clamp(value, 0.0, 1.0) > threshold);
    }
  \`);

  const staticNoise = wgslFn(\`\
    fn staticNoise(uv: vec2f, time: f32) -> f32 {
      let resolution = vec2f(\${ditherColumns}.0, \${ditherRows}.0);
      let noiseCoord = floor(uv * resolution);
      let animatedCoord = noiseCoord + vec2f(time * 17.0, time * 29.0);

      return fract(
        sin(dot(animatedCoord, vec2f(12.9898, 78.233))) * 43758.5453
      );
    }
  \`);

  const thermalEffect = Fn(([color]) => {
    const intensity = dot(color, vec3(0.299, 0.587, 0.114));
    const timeOffset = mod(time.div(10.0), 1.0);
    const hue = mod(intensity.mul(300.0).add(timeOffset.mul(360.0)), 360.0);
    const h = hue.div(60.0);
    const saturation = add(0.5, intensity.mul(2.0));
    const lightness = add(0.3, intensity.mul(0.25));
    const chroma = sub(1.0, abs(mul(2.0, lightness).sub(1.0))).mul(
      saturation,
    );
    const secondary = chroma.mul(sub(1.0, abs(mod(h, 2.0).sub(1.0))));
    const lightnessOffset = lightness.sub(chroma.div(2.0));
    const rgb = property('vec3');

    If(h.lessThan(1.0), () => {
      rgb.assign(vec3(chroma, secondary, 0.0));
    })
      .ElseIf(h.lessThan(2.0), () => {
        rgb.assign(vec3(secondary, chroma, 0.0));
      })
      .ElseIf(h.lessThan(3.0), () => {
        rgb.assign(vec3(0.0, chroma, secondary));
      })
      .ElseIf(h.lessThan(4.0), () => {
        rgb.assign(vec3(0.0, secondary, chroma));
      })
      .ElseIf(h.lessThan(5.0), () => {
        rgb.assign(vec3(secondary, 0.0, chroma));
      })
      .Else(() => {
        rgb.assign(vec3(chroma, 0.0, secondary));
      });

    return rgb.add(lightnessOffset);
  });

  return Fn(() => {
    const screenUv = uv();
    const coverUv = screenUv
      .sub(0.5)
      .mul(vec2(videoUvScaleX, videoUvScaleY))
      .add(0.5);
    const videoUv = vec2(coverUv.x, float(1.0).sub(coverUv.y));
    const videoColor = texture(videoTexture, videoUv).rgb;
    const color = vec3(videoColor).toVar();
    const drawUv = vec2(screenUv.x.mul(targetAspect), screenUv.y);
    const fillMask = float(0.0).toVar();
    const boxMask = float(0.0).toVar();
    const lineMask = float(0.0).toVar();

    for (let i = 0; i < maxBlobs; i++) {
      const state = resources.blobStateBuffer.element(i);
      const active = state.w.greaterThan(0.04).toFloat();
      const center = vec2(state.x.mul(targetAspect), state.y);
      const halfSize = vec2(state.z).mul(0.75);
      const distanceToBox = boxSdf(drawUv.sub(center), halfSize);
      const edgeWidth = fwidth(distanceToBox).mul(2.5);
      const fill = smoothstep(0.0, edgeWidth, distanceToBox)
        .oneMinus()
        .mul(active);
      const box = smoothstep(0.0, edgeWidth, abs(distanceToBox))
        .oneMinus()
        .mul(active);

      const nextState = resources.blobStateBuffer.element(
        (i + 1) % maxBlobs,
      );
      const nextActive = nextState.w.greaterThan(0.04).toFloat();
      const nextCenter = vec2(nextState.x.mul(targetAspect), nextState.y);
      const segment = nextCenter.sub(center);
      const projection = dot(drawUv.sub(center), segment)
        .div(max(dot(segment, segment), 0.0001))
        .clamp(0.0, 1.0);
      const straightPoint = center.add(segment.mul(projection));
      const segmentLength = distance(center, nextCenter);
      const direction = segment.div(max(segmentLength, 0.0001));
      const normal = vec2(direction.y.negate(), direction.x);
      const curveAmount = segmentLength.mul(0.2);
      const controlPoint1 = center
        .add(segment.mul(0.33))
        .add(normal.mul(curveAmount));
      const controlPoint2 = center
        .add(segment.mul(0.67))
        .sub(normal.mul(curveAmount));
      const t = projection;
      const oneMinusT = t.oneMinus();
      const curvedPoint = center
        .mul(oneMinusT.mul(oneMinusT).mul(oneMinusT))
        .add(controlPoint1.mul(3.0).mul(oneMinusT).mul(oneMinusT).mul(t))
        .add(controlPoint2.mul(3.0).mul(oneMinusT).mul(t).mul(t))
        .add(nextCenter.mul(t.mul(t).mul(t)));
      const segmentPoint = mix(straightPoint, curvedPoint, segmentType);
      const line = smoothstep(
        0.0,
        0.002,
        distance(drawUv, segmentPoint),
      )
        .oneMinus()
        .mul(active)
        .mul(nextActive);

      fillMask.assign(max(fillMask, fill));
      boxMask.assign(max(boxMask, box));
      lineMask.assign(max(lineMask, line));
    }

    const effectColor = vec3(0.0).toVar();

    If(effectType, () => {
      effectColor.assign(thermalEffect(videoColor));
    }).Else(() => {
      const ditherUv = snapDitherUv(screenUv);
      const pixelatedCoverUv = ditherUv
        .sub(0.5)
        .mul(vec2(videoUvScaleX, videoUvScaleY))
        .add(0.5);
      const pixelatedVideoUv = vec2(
        pixelatedCoverUv.x,
        float(1.0).sub(pixelatedCoverUv.y),
      );
      const pixelatedColor = texture(videoTexture, pixelatedVideoUv).rgb;
      const luminance = dot(
        pixelatedColor,
        vec3(0.299, 0.587, 0.114),
      );
      const chromaticOffset = vec2(0.5 / ditherRows, 0.0);
      const chromaticDither = vec3(
        orderedDither(screenUv.sub(chromaticOffset), luminance),
        orderedDither(screenUv, luminance),
        orderedDither(screenUv.add(chromaticOffset), luminance),
      );
      const noise = staticNoise(screenUv, time).sub(0.5).mul(0.08);
      const ditherColor = chromaticDither.add(vec3(noise));

      effectColor.assign(ditherColor);
    });

    color.assign(mix(videoColor, effectColor, fillMask));
    color.assign(mix(color, vec3(1.0), max(boxMask, lineMask)));

    return vec4(color, 1.0);
  })();
};
`;

export default PostprocessingCode;
