const PostprocessingCode = `import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import {
  mix,
  pow,
  texture,
  uv,
  vec3,
  vec4,
  wgslFn,
} from 'three/tsl';

const BLUE = pow(vec3(0.133, 0.51, 0.933), vec3(2.2));
const WHITE = vec3(1.0);

export const createOutputNodes = ({
  arrowRowCount,
  resources,
  targetAspect,
}) => {
  const arrowRows = arrowRowCount;
  const arrowColumns = Math.max(1, Math.round(arrowRows * targetAspect));

  const snapArrowUv = wgslFn(\`\
    fn snapArrowUv(inputUv: vec2f) -> vec2f {
      let grid = vec2f(\${arrowColumns}.0, \${arrowRows}.0);

      return (floor(inputUv * grid) + vec2f(0.5)) / grid;
    }
  \`);

  const arrowVectorMotion = wgslFn(\`\
    fn arrowVectorMotion(
      stateTexture: texture_2d<f32>,
      inputUv: vec2f,
      snappedUv: vec2f
    ) -> f32 {
      let grid = vec2f(\${arrowColumns}.0, \${arrowRows}.0);
      let cellUv = ((inputUv - snappedUv) * grid + vec2f(0.5)) * 2.0 - 1.0;
      let state = textureLoad(
        stateTexture,
        clamp(
          vec2i(snappedUv * vec2f(textureDimensions(stateTexture))),
          vec2i(0),
          vec2i(textureDimensions(stateTexture)) - vec2i(1)
        ),
        0
      );
      let motion = smoothstep(0.04, 0.18, state.a);
      let flow = state.gb * 2.0 - 1.0;
      let flowLength = length(flow);

      if (motion <= 0.0 || flowLength <= 0.001) {
        return 0.0;
      }

      let direction = flow / flowLength;
      let normal = vec2f(-direction.y, direction.x);
      let arrowUv = vec2f(dot(cellUv, direction), dot(cellUv, normal));
      let directionConfidence = smoothstep(0.08, 0.65, flowLength);
      let motionConfidence = smoothstep(0.04, 0.3, state.a);
      let scale = mix(0.45, 1.0, directionConfidence * motionConfidence);
      let arrowTail = -0.58;
      let arrowTip = 0.66;
      let shaftEnd = 0.1;
      let shaftHalfWidth = 0.065;
      let headStart = -0.20;
      let headBaseWidth = 0.42;
      let shaft = select(0.0, 1.0, arrowUv.x >= arrowTail * scale) *
        select(0.0, 1.0, arrowUv.x <= shaftEnd * scale) *
        select(0.0, 1.0, abs(arrowUv.y) <= shaftHalfWidth * scale);
      let headHalfWidth = max(
        (arrowTip * scale - arrowUv.x) * headBaseWidth,
        0.0
      );
      let head = select(0.0, 1.0, arrowUv.x >= headStart * scale) *
        select(0.0, 1.0, arrowUv.x <= arrowTip * scale) *
        select(0.0, 1.0, abs(arrowUv.y) <= headHalfWidth);

      return max(shaft, head) * motion;
    }
  \`);

  const createArrowPattern = (stateIndex) => {
    const screenUv = uv();
    const snappedUv = snapArrowUv({ inputUv: screenUv });

    return arrowVectorMotion({
      inputUv: screenUv,
      snappedUv,
      stateTexture: texture(resources.stateTextures[stateIndex]),
    });
  };

  const createOutputNode = (stateIndex) => {
    const arrowPattern = createArrowPattern(stateIndex);
    const baseOutput = vec4(mix(BLUE, WHITE, arrowPattern), 1.0);
    const bloomSource = vec4(vec3(arrowPattern), 1.0);
    const arrowBloom = bloom(bloomSource, 0.75, 0.5, 0.5);

    return baseOutput.add(arrowBloom);
  };

  return [createOutputNode(1), createOutputNode(0)];
};
`;

export default PostprocessingCode;
