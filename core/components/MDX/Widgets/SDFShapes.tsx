import React, { useId, useMemo, useState } from 'react';

import { ShaderPlayground } from '@core/components/MDX/Widgets/ShaderPlayground';
import { Select } from '@core/components/Select';
import { Slider } from '@core/components/Slider';

type Shape =
  | 'box'
  | 'circle'
  | 'crosshair'
  | 'segment'
  | 'cubicBezier'
  | 'arrow';

const SHAPES: { label: string; value: Shape }[] = [
  { label: 'Box', value: 'box' },
  { label: 'Circle', value: 'circle' },
  { label: 'Crosshair', value: 'crosshair' },
];

const SEGMENTS: { label: string; value: Shape }[] = [
  { label: 'Segment', value: 'segment' },
  { label: 'Cubic Bezier', value: 'cubicBezier' },
];

const SDF_HELPERS = {
  box: `float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;

  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}`,
  circle: `float sdCircle(vec2 p, float radius) {
  return length(p) - radius;
}`,
  segment: `float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;

  float segmentLengthSq = max(dot(ba, ba), 0.0001);
  float projection = dot(pa, ba) / segmentLengthSq;
  float t = clamp(projection, 0.0, 1.0);

  vec2 closestPoint = a * (1.0 - t) + b * t;

  return smoothstep(0.0, uThickness, length(p - closestPoint));
}`,
  cubicBezier: `vec2 cubicBezier(vec2 a, vec2 c1, vec2 c2, vec2 b, float t) {
  return
    a * (1.0 - t) * (1.0 - t) * (1.0 - t) +
    c1 * 3.0 * (1.0 - t) * (1.0 - t) * t +
    c2 * 3.0 * (1.0 - t) * t * t +
    b * t * t * t;
}
  
float sdCubicBezier(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;

  float segmentLengthSq = max(dot(ba, ba), 0.0001);
  float projection = dot(pa, ba) / segmentLengthSq;
  float t = clamp(projection, 0.0, 1.0);

  vec2 direction = ba / max(length(ba), 0.0001);
  vec2 normal = vec2(-direction.y, direction.x);

  vec2 c1 = a + ba * 0.33 + normal * uC1Offset;
  vec2 c2 = a + ba * 0.67 + normal * uC2Offset;

  vec2 closestPoint = cubicBezier(a, c1, c2, b, t);

  float curveDistance = length(p - closestPoint);
  float startCapDistance = length(p - a);
  float endCapDistance = length(p - b);
  
  float distanceToCurve = min(curveDistance, min(startCapDistance, endCapDistance));

  return smoothstep(0.0, uThickness, distanceToCurve);
}`,
  arrow: `float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  vec2 e0 = p1 - p0;
  vec2 e1 = p2 - p1;
  vec2 e2 = p0 - p2;

  vec2 v0 = p - p0;
  vec2 v1 = p - p1;
  vec2 v2 = p - p2;

  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);

  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(
    min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
    vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
    vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x))
  );

  return -sqrt(d.x) * sign(d.y);
}

float sdArrow(vec2 p, vec2 a, vec2 b) {
  vec2 ba = b - a;
  vec2 direction = ba / max(length(ba), 0.0001);
  vec2 normal = vec2(-direction.y, direction.x);
  vec2 center = (a + b) * 0.5;
  vec2 arrowUv = vec2(dot(p - center, direction), dot(p - center, normal));

  float scale = length(ba) * 0.5;
  float arrowTail = uArrowTailPosition * scale;
  float arrowTip = 0.66 * scale;
  float shaftEnd = (uArrowTailPosition + uArrowTailLength) * scale;
  float shaftHalfWidth = 0.065 * scale;
  float headStart = uArrowHeadStart * scale;
  float headBaseWidth = uArrowHeadWidth;

  vec2 shaftCenter = vec2((arrowTail + shaftEnd) * 0.5, 0.0);
  vec2 shaftSize = vec2((shaftEnd - arrowTail) * 0.5, shaftHalfWidth);
  float shaft = sdBox(arrowUv - shaftCenter, shaftSize);

  float headHalfWidth = max((arrowTip - headStart) * headBaseWidth, 0.0);
  float head = sdTriangle(
    arrowUv,
    vec2(arrowTip, 0.0),
    vec2(headStart, headHalfWidth),
    vec2(headStart, -headHalfWidth)
  );

  return min(shaft, head);
}`,
};

const SHAPE_SNIPPETS: Record<Shape, string> = {
  box: `float shapeDistance(vec2 p) {
  return abs(sdBox(p, vec2(0.5, 0.5)));
}`,
  circle: `float shapeDistance(vec2 p) {
  return abs(sdCircle(p, 0.5));
}`,
  crosshair: `float shapeDistance(vec2 p) {
  float horizontal = sdSegment(p, vec2(-0.38, 0.0), vec2(0.38, 0.0));
  float vertical = sdSegment(p, vec2(0.0, -0.38), vec2(0.0, 0.38));

  return min(horizontal, vertical);
}`,
  segment: `float shapeDistance(vec2 p) {
  vec2 start = vec2(0.1, 0.9) * 2.0 - 1.0;
  vec2 end = vec2(0.9, 0.1) * 2.0 - 1.0;

  return sdSegment(p, start, end);
}`,
  cubicBezier: `float shapeDistance(vec2 p) {
  vec2 start = vec2(0.1, 0.9) * 2.0 - 1.0;
  vec2 end = vec2(0.9, 0.1) * 2.0 - 1.0;

  return sdCubicBezier(p, start, end);
}`,
  arrow: `float shapeDistance(vec2 p) {
  vec2 start = vec2(0.1, 0.9) * 2.0 - 1.0;
  vec2 end = vec2(0.9, 0.1) * 2.0 - 1.0;

  return max(sdArrow(p, start, end), 0.0);
}`,
};

const DISPLAYED_CODE: Record<Shape, string> = {
  box: `${SDF_HELPERS.box}

${SHAPE_SNIPPETS.box}`,
  circle: `${SDF_HELPERS.circle}

${SHAPE_SNIPPETS.circle}`,
  crosshair: `${SDF_HELPERS.segment}

${SHAPE_SNIPPETS.crosshair}`,
  segment: `${SDF_HELPERS.segment}

${SHAPE_SNIPPETS.segment}`,
  cubicBezier: `${SDF_HELPERS.cubicBezier}

${SHAPE_SNIPPETS.cubicBezier}`,
  arrow: `${SDF_HELPERS.box}

${SDF_HELPERS.arrow}

${SHAPE_SNIPPETS.arrow}`,
};

const getFragmentShader = (shape: Shape) => `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uThickness;
uniform float uC1Offset;
uniform float uC2Offset;
uniform float uArrowHeadWidth;
uniform float uArrowHeadStart;
uniform float uArrowTailLength;
uniform float uArrowTailPosition;

${SDF_HELPERS.box}

${SDF_HELPERS.circle}

${SDF_HELPERS.segment}

${SDF_HELPERS.cubicBezier}

${SDF_HELPERS.arrow}

${SHAPE_SNIPPETS[shape]}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  float distanceToShape = shapeDistance(p);
  float lineWidth = 0.018;
  float antialias = fwidth(distanceToShape);
  float line = 1.0 - smoothstep(lineWidth, lineWidth + antialias, distanceToShape);

  vec3 background = vec3(0.133, 0.51, 0.933);
  vec3 shapeColor = vec3(1.0);
  vec3 color = mix(background, shapeColor, line);

  fragColor = vec4(color, 1.0);
}
`;

type SDFShapesProps = {
  variant?: 'shapes' | 'segments' | 'arrows';
};

export const SDFShapes = (props: SDFShapesProps) => {
  const { variant = 'shapes' } = props;

  const [shape, setShape] = useState<Shape>(
    variant === 'shapes' ? 'box' : variant === 'arrows' ? 'arrow' : 'segment'
  );
  const [bezierThickness, setBezierThickness] = useState(0.27);
  const [c1Offset, setC1Offset] = useState(0.67);
  const [c2Offset, setC2Offset] = useState(-0.33);
  const [arrowHeadWidth, setArrowHeadWidth] = useState(0.42);
  const [arrowHeadStart, setArrowHeadStart] = useState(-0.2);
  const [arrowTailLength, setArrowTailLength] = useState(0.68);
  const [arrowTailPosition, setArrowTailPosition] = useState(-0.58);
  const id = useId();

  const selectedShape = variant === 'arrows' ? 'arrow' : shape;
  const fragmentShader = useMemo(
    () => getFragmentShader(selectedShape),
    [selectedShape]
  );
  const showThicknessControl =
    selectedShape === 'segment' || selectedShape === 'cubicBezier';

  return (
    <ShaderPlayground
      fullBleedWidth={50}
      key={fragmentShader}
      fragmentShader={fragmentShader}
      uniforms={{
        uThickness: bezierThickness,
        uC1Offset: c1Offset,
        uC2Offset: c2Offset,
        uArrowHeadWidth: arrowHeadWidth,
        uArrowHeadStart: arrowHeadStart,
        uArrowTailLength: arrowTailLength,
        uArrowTailPosition: arrowTailPosition,
      }}
      codeString={DISPLAYED_CODE[selectedShape]}
      showGrid
      showCode
      gridSize={10}
    >
      {variant !== 'arrows' ? (
        <Select
          id={`${id}-shape`}
          label="Shape"
          items={variant === 'shapes' ? SHAPES : SEGMENTS}
          value={shape}
          onChange={(value) => {
            if (!value) return;

            setShape(value as Shape);
          }}
          size="md"
        />
      ) : null}

      {variant === 'segments' && showThicknessControl ? (
        <Slider
          hideDots
          id={`${id}-bezier-thickness`}
          label="Thickness"
          min={0.1}
          max={0.4}
          step={0.01}
          value={bezierThickness}
          onChange={setBezierThickness}
        />
      ) : null}
      {selectedShape === 'cubicBezier' ? (
        <>
          <Slider
            hideDots
            id={`${id}-c1-offset`}
            label="C1 Offset"
            min={-1}
            max={1}
            step={0.01}
            value={c1Offset}
            onChange={setC1Offset}
          />
          <Slider
            hideDots
            id={`${id}-c2-offset`}
            label="C2 Offset"
            min={-1}
            max={1}
            step={0.01}
            value={c2Offset}
            onChange={setC2Offset}
          />
        </>
      ) : null}
      {selectedShape === 'arrow' ? (
        <>
          <Slider
            hideDots
            id={`${id}-arrow-head-width`}
            label="Head Width"
            min={0.12}
            max={0.8}
            step={0.01}
            value={arrowHeadWidth}
            onChange={setArrowHeadWidth}
          />
          <Slider
            hideDots
            id={`${id}-arrow-head-start`}
            label="Head Start"
            min={-0.55}
            max={0.35}
            step={0.01}
            value={arrowHeadStart}
            onChange={setArrowHeadStart}
          />
          <Slider
            hideDots
            id={`${id}-arrow-tail-length`}
            label="Tail Length"
            min={0.2}
            max={1.1}
            step={0.01}
            value={arrowTailLength}
            onChange={setArrowTailLength}
          />
          <Slider
            hideDots
            id={`${id}-arrow-tail-position`}
            label="Tail Position"
            min={-0.9}
            max={-0.05}
            step={0.01}
            value={arrowTailPosition}
            onChange={setArrowTailPosition}
          />
        </>
      ) : null}
    </ShaderPlayground>
  );
};
