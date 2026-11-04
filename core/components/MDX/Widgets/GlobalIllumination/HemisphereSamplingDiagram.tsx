import { useId } from 'react';

import { Diagram } from './Diagram';
import {
  arrowPaths,
  createProjection,
  dot,
  multiply,
  Point3,
  Viewport,
  visibleBoxFaces,
} from './geometry';
import {
  HEMISPHERE_SAMPLES,
  SAMPLING_STEPS,
  samplingFrame,
  SamplingState,
} from './hemisphereSamplingScene';

export interface HemisphereSamplingDiagramProps {
  className?: string;
}

const FORMULAS = [
  'n = normalize(surfaceWorldNormal)',
  't = normalize(cross(axis, n)); b = cross(n, t)',
  'r = √((i + random.x) / 8); φ = 2π random.y',
  'x = r cos φ; y = r sin φ; z = √(1 − u₁)',
  'direction = x t + y b + z n',
];

function SamplingScene({
  state,
  viewport,
}: {
  state: SamplingState;
  viewport: Viewport;
}) {
  const id = useId();
  const stage = Math.round(state.step);
  const { width, height } = viewport;
  const frame = samplingFrame([Math.sin(state.tilt), Math.cos(state.tilt), 0]);
  const projection = createProjection(viewport, {
    azimuth: 225,
    elevation: 32,
    zoom: 1,
    target: [0, -0.25, 0],
    span: [4.1, 3.8],
  });
  const { project, path, label } = projection;
  const local = (x: number, y: number, z = 0) => frame.toWorld(x, y, z);
  const origin: Point3 = [0, 0, 0];
  const [ox, oy] = project(origin);
  const circle = (radius: number, elevation = 0) =>
    Array.from({ length: 65 }, (_, i) =>
      local(
        radius * Math.cos((i * Math.PI) / 32),
        radius * Math.sin((i * Math.PI) / 32),
        elevation
      )
    );
  const faces = visibleBoxFaces(
    { min: [-1.2, -0.14, -1.2], max: [1.2, -0.025, 1.2] },
    [
      dot(projection.eye, frame.tangent),
      dot(projection.eye, frame.n),
      dot(projection.eye, frame.bitangent),
    ]
  ).map((face) => face.map(([x, y, z]) => local(x, z, y)));
  const arrow = (end: Point3, color: string, opacity = 1) => {
    const paths = arrowPaths(project(origin), project(end));
    return (
      <g opacity={opacity} stroke={color} strokeWidth={1.3} fill="none">
        <path d={paths.shaft} />
        <path d={paths.head} fill={color} />
      </g>
    );
  };

  return (
    <g>
      <defs>
        <pattern
          id={`${id}-hatch`}
          width="3"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-30)"
        >
          <path d="M 0 0 V 6" stroke="var(--gi-edge)" strokeWidth="0.75" />
        </pattern>
      </defs>
      <text
        x={width / 2}
        y={height - 69}
        textAnchor="middle"
        fill="var(--text-primary)"
        style={{ fontSize: width < 500 ? 11 : 12 }}
      >
        {SAMPLING_STEPS[stage].title}
      </text>
      <text
        x={width / 2}
        y={height - 44}
        textAnchor="middle"
        fill="var(--text-secondary)"
        style={{ textTransform: 'none', fontSize: width < 500 ? 9 : 12 }}
      >
        {FORMULAS[stage]}
      </text>

      {faces.map((face, index) => (
        <g key={index}>
          <path d={path(face, true)} fill="var(--card-bg)" />
          <path
            d={path(face, true)}
            fill={
              face.every(
                (point) => Math.abs(dot(point, frame.bitangent) + 1.2) < 0.0001
              )
                ? `url(#${id}-hatch)`
                : 'none'
            }
          />
        </g>
      ))}
      <path d={projection.outline(faces)} stroke="var(--gi-edge)" fill="none" />

      <g opacity={state.disk} fill="none" stroke="var(--gi-edge)">
        <path d={path(circle(1))} opacity={0.9} />
      </g>
      <g opacity={state.lift * 0.5} stroke="var(--gi-edge)" fill="none">
        {[0, Math.PI / 2].map((angle) => (
          <path
            key={angle}
            d={path(
              Array.from({ length: 49 }, (_, i) => {
                const theta = (i * Math.PI) / 48;
                return local(
                  Math.cos(theta) * Math.cos(angle),
                  Math.cos(theta) * Math.sin(angle),
                  Math.sin(theta)
                );
              })
            )}
          />
        ))}
      </g>

      {arrow(multiply(frame.n, 1.35), 'var(--accent)')}
      <text
        {...label(multiply(frame.n, 1.35), 'n', [9, -4])}
        fill="var(--accent)"
        style={{ textTransform: 'none' }}
      >
        n
      </text>
      <g opacity={state.frame}>
        {arrow(multiply(frame.tangent, 1.65), 'var(--text-secondary)')}
        {arrow(multiply(frame.bitangent, 1.65), 'var(--text-secondary)')}
        <text
          {...label(multiply(frame.tangent, 1.65), 't', [6, 12])}
          fill="var(--text-secondary)"
          style={{ textTransform: 'none' }}
        >
          t
        </text>
        <text
          {...label(multiply(frame.bitangent, 1.65), 'b', [-10, 12])}
          fill="var(--text-secondary)"
          style={{ textTransform: 'none' }}
        >
          b
        </text>
      </g>

      <g opacity={state.disk}>
        {HEMISPHERE_SAMPLES.map((sample) => {
          const endpoint = local(sample.x, sample.y, sample.z * state.lift);
          const [x, y] = project(endpoint);
          const color = 'var(--text-secondary)';

          return (
            <g key={sample.index}>
              <path
                d={path([origin, endpoint])}
                stroke={color}
                strokeWidth={1.3}
                opacity={0.5 * state.lift}
                fill="none"
              />
              <circle cx={x} cy={y} r={2.7} fill={color} />
            </g>
          );
        })}
      </g>
      <circle
        cx={ox}
        cy={oy}
        r={4}
        fill="var(--card-bg)"
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <text {...label(origin, 'P', [-16, 17])} fill="var(--accent)">
        P
      </text>
    </g>
  );
}

export function HemisphereSamplingDiagram({
  className,
}: HemisphereSamplingDiagramProps) {
  return (
    <Diagram
      className={className}
      label="Cosine-weighted hemisphere sampling"
      steps={SAMPLING_STEPS}
    >
      {(state, viewport) => <SamplingScene state={state} viewport={viewport} />}
    </Diagram>
  );
}

export default HemisphereSamplingDiagram;
