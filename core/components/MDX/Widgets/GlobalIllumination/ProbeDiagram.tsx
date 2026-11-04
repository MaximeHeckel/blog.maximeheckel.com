import { useId } from 'react';

import { Diagram } from './Diagram';
import {
  Point3,
  Viewport,
  add,
  arc,
  arrowPaths,
  createProjection,
  dot,
  intersectBox,
  visibleBoxFaces,
} from './geometry';
import {
  SAMPLE_AXES,
  orientSample,
  NEIGHBORS,
  PROBES,
  PROBE_GRID_EDGES,
  PROBE_RAYS,
  PROBE_STEPS,
  ProbeState,
  SELECTED_PROBE,
} from './probeScene';
import { CAMERA, CUBE, SLAB, SURFACE_POINT } from './raymarchingScene';

export interface ProbeDiagramProps {
  className?: string;
}

const emphasis = (value: number) =>
  `color-mix(in oklch, var(--accent) ${Math.max(0, Math.min(1, value)) * 100}%, var(--text-secondary))`;

function ProbeScene({
  state,
  viewport,
}: {
  state: ProbeState;
  viewport: Viewport;
}) {
  const hatchId = useId();
  const { project, path, outline, eye, label } = createProjection(viewport, {
    ...CAMERA,
    azimuth: state.cameraAzimuth,
    elevation: state.cameraElevation,
    zoom: state.cameraZoom,
    target: [state.cameraTargetX, state.cameraTargetY, state.cameraTargetZ],
  });
  const origin = SELECTED_PROBE.position;
  const neighbors = new Set(NEIGHBORS.map((probe) => probe.id));
  const focus = state.gather;
  const pixel = add(SURFACE_POINT, [0, 0.008, 0]);
  const pixelCorners: Point3[] = [
    [-0.17, 0, -0.17],
    [0.17, 0, -0.17],
    [0.17, 0, 0.17],
    [-0.17, 0, 0.17],
  ];
  const pixelLabelOffset =
    Math.max(...pixelCorners.map((corner) => project(add(pixel, corner))[1])) -
    project(pixel)[1] +
    24;

  // Orbit and zoom around the selected probe without sliding it on screen.
  const initial = PROBE_STEPS[0].state;
  const reference = createProjection(viewport, {
    ...CAMERA,
    target: [
      initial.cameraTargetX,
      initial.cameraTargetY,
      initial.cameraTargetZ,
    ],
  }).project(origin);
  const projectedOrigin = project(origin);
  // Release the sampling anchor when framing the surface/probe blend close-up.
  const offset = [
    (reference[0] - projectedOrigin[0]) * (1 - state.blend),
    (reference[1] - projectedOrigin[1]) * (1 - state.blend),
  ];
  const sampleVisibility = [
    state.sampleX,
    state.sampleY,
    state.sampleZ,
    state.sampleNegativeX,
    state.sampleNegativeY,
    state.sampleNegativeZ,
  ];

  const probes = PROBES.filter((probe) => !probe.inside)
    .filter(
      (probe) =>
        probe.id === SELECTED_PROBE.id ||
        (neighbors.has(probe.id) && probe.blocked && state.rejected > 0) ||
        intersectBox(probe.position, eye, CUBE) === null
    )
    .sort((a, b) => dot(a.position, eye) - dot(b.position, eye));

  return (
    <g transform={`translate(${offset[0]} ${offset[1]})`}>
      <defs>
        <pattern
          id={hatchId}
          width={3}
          height={6}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-30)"
        >
          <path
            d="M 0 0 V 6"
            fill="none"
            stroke="var(--gi-edge)"
            strokeWidth={0.75}
          />
        </pattern>
      </defs>
      {[SLAB, CUBE].map((box, index) => {
        const faces = visibleBoxFaces(box, eye);
        return (
          <g key={index}>
            {faces.map((face, faceIndex) => (
              <g key={faceIndex}>
                <path d={path(face, true)} fill="var(--background)" />
                {face.every((point) => point[2] === box.min[2]) ? (
                  <path d={path(face, true)} fill={`url(#${hatchId})`} />
                ) : null}
              </g>
            ))}
            <path
              d={outline(faces)}
              fill="none"
              stroke="var(--gi-edge)"
              strokeWidth={1}
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* The lattice explains spatial placement, not lighting connections. */}
      <g
        opacity={state.overview * 0.3}
        fill="none"
        stroke="var(--text-secondary)"
        strokeWidth={0.75}
        strokeDasharray="2 4"
      >
        {PROBE_GRID_EDGES.filter(
          ({ from, to }) => probes.includes(from) && probes.includes(to)
        ).map(({ from, to }) => (
          <path
            key={`${from.id}-${to.id}`}
            d={path([from.position, to.position])}
          />
        ))}
      </g>

      {/* Lookup lines carry no arrowheads: probes are caches, not light sources. */}
      {NEIGHBORS.map((probe) => {
        const opacity = probe.blocked ? state.rejected : state.lookup;
        const obstruction = probe.blocked ? probe.hit : null;
        const [cx, cy] = project(obstruction?.point ?? SURFACE_POINT);
        return (
          <g key={probe.id} opacity={opacity}>
            <path
              d={path([SURFACE_POINT, probe.position])}
              fill="none"
              stroke={
                probe.blocked ? 'var(--text-secondary)' : emphasis(state.blend)
              }
              strokeWidth={1.5}
              strokeDasharray={probe.blocked ? '3 5' : undefined}
            />
            {obstruction ? (
              <path
                d={`M ${cx - 4} ${cy - 4} l 8 8 M ${cx - 4} ${cy + 4} l 8 -8`}
                transform={`rotate(45 ${cx} ${cy})`}
                stroke="var(--text-secondary)"
                strokeWidth={1.5}
              />
            ) : null}
          </g>
        );
      })}

      {SAMPLE_AXES.map((axis, axisIndex) => (
        <g
          key={axis}
          opacity={sampleVisibility[axisIndex]}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
        >
          {(['xz', 'xy', 'yz'] as const).map((plane) => (
            <path
              key={plane}
              d={path(
                arc([0, 0, 0], 0.75, plane).map((point) =>
                  add(origin, orientSample(point, axisIndex))
                )
              )}
            />
          ))}
          {PROBE_RAYS[axisIndex].map((ray, index) => {
            const arrow = arrowPaths(
              project(origin),
              project(ray.tip),
              !ray.hit
            );
            const [cx, cy] = project(ray.tip);
            return (
              <g key={index}>
                <path d={arrow.shaft} strokeWidth={1.2} />
                {ray.hit ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill="var(--accent)"
                    stroke="none"
                  />
                ) : (
                  <path d={arrow.head} fill="var(--accent)" stroke="none" />
                )}
              </g>
            );
          })}
          <text
            x={viewport.width - 24 - offset[0]}
            y={40 - offset[1]}
            textAnchor="end"
            fill="var(--accent)"
            stroke="none"
          >
            Gather light from {axis}
          </text>
        </g>
      ))}

      {probes.map((probe) => {
        const selected = probe.id === SELECTED_PROBE.id;
        const nearby = neighbors.has(probe.id);
        const opacity = Math.max(
          state.overview * 0.6,
          selected ? focus : 0,
          nearby ? (probe.blocked ? state.rejected : state.lookup) : 0
        );
        const [cx, cy] = project(probe.position);
        const color = emphasis(
          Math.max(
            selected ? focus : 0,
            nearby && !probe.blocked ? state.blend : 0
          )
        );
        return (
          <g key={probe.id} opacity={opacity}>
            <circle
              cx={cx}
              cy={cy}
              r={selected ? 5 : 4}
              fill="var(--background)"
              stroke={color}
              strokeWidth={1.5}
            />
            <circle cx={cx} cy={cy} r={1.3} fill={color} />
          </g>
        );
      })}

      <g opacity={state.pixel}>
        <path
          d={path(
            pixelCorners.map((corner) => add(pixel, corner)),
            true
          )}
          fill={emphasis(state.pixelEmphasis)}
          fillOpacity={0.06 + state.shade * 0.65}
          stroke={emphasis(state.pixelEmphasis)}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <text
          {...label(pixel, 'Surface pixel', [24, pixelLabelOffset], true)}
          fill={emphasis(state.pixelEmphasis)}
          opacity={1 - state.blend}
        >
          Surface pixel
        </text>
        <text
          {...label(
            pixel,
            '(with indirect light)',
            [24, pixelLabelOffset + 18],
            true
          )}
          fill="var(--accent)"
          opacity={state.shade}
        >
          (with indirect light)
        </text>
      </g>
      <text
        x={Math.max(80, viewport.width * 0.23) - offset[0]}
        y={viewport.height - 95 - offset[1]}
        textAnchor="middle"
        fill="var(--text-secondary)"
        opacity={state.overview * (1 - state.pixel)}
      >
        World-space probes
      </text>
      <text
        {...label(NEIGHBORS[4].position, 'Occluded', [12, -12])}
        fill="var(--text-secondary)"
        opacity={state.rejected}
      >
        Occluded
      </text>
      <text
        {...label(SURFACE_POINT, 'Blend probe estimates', [0, 42], true)}
        fill="var(--accent)"
        opacity={state.blend}
      >
        Blend probe estimates
      </text>
    </g>
  );
}

export function ProbeDiagram({ className }: ProbeDiagramProps) {
  return (
    <Diagram
      label="Indirect light from world-space probes"
      className={className}
      steps={PROBE_STEPS}
    >
      {(state, viewport) => <ProbeScene state={state} viewport={viewport} />}
    </Diagram>
  );
}

export default ProbeDiagram;
