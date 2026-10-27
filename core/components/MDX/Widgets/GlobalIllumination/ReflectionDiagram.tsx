import { styled } from '@maximeheckel/design-system';
import { useId, useState } from 'react';

import { Slider } from '@core/components/Slider';

import { Diagram, DiagramStep } from './Diagram';
import {
  Point3,
  add,
  arrowPaths,
  createProjection,
  dot,
  mix,
  intersectBox,
  multiply,
  visibleBoxFaces,
} from './geometry';
import { CAMERA, CUBE, SLAB, SURFACE_POINT } from './raymarchingScene';

const Root = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
});

const initial = {
  viewing: 0,
  pixel: 0,
  pixelLabel: 0,
  reflection: 0,
  rayEmphasis: 0,
  hitLabel: 0,
  result: 0,
  zoom: 1,
  elevation: CAMERA.elevation,
  targetX: -0.45,
  targetY: 0.35,
};
const closeUp = { zoom: 2, elevation: 25, targetX: -0.9, targetY: 0.55 };
const steps: readonly [
  DiagramStep<typeof initial>,
  ...DiagramStep<typeof initial>[],
] = [
  {
    title: 'View the scene',
    description: 'A camera views the cube and reflective slab.',
    state: initial,
  },
  {
    title: 'Choose a surface pixel',
    description:
      'Follow the viewing ray from the camera lens to a surface pixel.',
    state: { ...initial, ...closeUp, viewing: 1, pixel: 1, pixelLabel: 1 },
  },
  {
    title: 'Trace the reflection',
    description:
      'Reflect the viewing direction around the surface normal and trace to the cube.',
    state: {
      ...initial,
      ...closeUp,
      viewing: 1,
      reflection: 1,
      rayEmphasis: 1,
      hitLabel: 1,
    },
  },
  {
    title: 'Add the reflected light',
    description:
      'The hit surface contributes radiance to the reflective pixel. The blue fill illustrates this contribution rather than computing a lighting result.',
    state: {
      ...initial,
      viewing: 1,
      reflection: 1,
      pixel: 1,
      pixelLabel: 1,
      result: 1,
    },
  },
];

export default function ReflectionDiagram() {
  const id = useId();
  const [distance, setDistance] = useState(1.8);

  return (
    <Root>
      <Diagram label="A mirror reflection at one surface point" steps={steps}>
        {(state, viewport) => {
          const { project, path, outline, eye, label } = createProjection(
            viewport,
            {
              ...CAMERA,
              elevation: state.elevation,
              zoom: state.zoom,
              target: [state.targetX, state.targetY, 0.1],
            }
          );
          const point: Point3 = [
            SURFACE_POINT[0],
            SLAB.max[1] + 0.025,
            SURFACE_POINT[2],
          ];
          const viewer = add(point, [-distance, 1.8, 0]);
          // Reflect the camera-to-surface direction around the upward normal.
          const direction = multiply(
            [distance, 1.8, 0],
            1 / Math.hypot(distance, 1.8)
          );
          const hit = intersectBox(point, direction, CUBE);
          const tip = hit?.point ?? add(point, multiply(direction, 3));
          // Orient the camera body and lens along the viewing direction.
          const forward = multiply(
            [distance, -1.8, 0],
            1 / Math.hypot(distance, 1.8)
          );
          const up: Point3 = [-forward[1], forward[0], 0];
          const cameraPoint = ([x, y, z]: Point3) =>
            add(
              viewer,
              add(multiply(forward, x), add(multiply(up, y), [0, 0, z]))
            );
          const cameraEye: Point3 = [dot(eye, forward), dot(eye, up), eye[2]];
          const lens = cameraPoint([0.32, 0, 0]);
          const incoming = arrowPaths(
            project(lens),
            project(mix(lens, point, state.viewing))
          );
          const reflected = arrowPaths(
            project(point),
            project(mix(point, tip, state.reflection)),
            !hit
          );
          const viewerFaces = visibleBoxFaces(
            { min: [-0.19, -0.12, -0.15], max: [0.19, 0.12, 0.15] },
            cameraEye
          ).map((face) => face.map(cameraPoint));
          const lensFaces = visibleBoxFaces(
            { min: [0.19, -0.075, -0.09], max: [0.32, 0.075, 0.09] },
            cameraEye
          ).map((face) => face.map(cameraPoint));
          const rayColor = `color-mix(in oklch, var(--accent) ${state.rayEmphasis * 100}%, var(--text-secondary))`;
          const pixelCorners: Point3[] = [
            [-0.17, 0, -0.17],
            [0.17, 0, -0.17],
            [0.17, 0, 0.17],
            [-0.17, 0, 0.17],
          ];
          const [hx, hy] = project(tip);
          return (
            <>
              <defs>
                <pattern
                  id={`${id}-hatch`}
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
                    {faces.map((face, i) => (
                      <g key={i}>
                        <path d={path(face, true)} fill="var(--background)" />
                        {face.every((vertex) => vertex[2] === box.min[2]) ? (
                          <path
                            d={path(face, true)}
                            fill={`url(#${id}-hatch)`}
                          />
                        ) : null}
                      </g>
                    ))}
                    <path
                      d={outline(faces)}
                      fill="none"
                      stroke="var(--gi-edge)"
                      strokeWidth={1}
                    />
                    {index === 0 ? (
                      <g
                        fill="none"
                        stroke="var(--gi-edge)"
                        strokeWidth={0.75}
                        strokeLinecap="round"
                        opacity={0.65}
                      >
                        {[
                          { x: -2.4, length: 1.2 },
                          { x: -2.15, length: 0.65 },
                        ].map(({ x, length }, mark) => (
                          <path
                            key={mark}
                            d={path([
                              [x, SLAB.max[1] + 0.003, -1.6 - length / 2],
                              [x, SLAB.max[1] + 0.003, -1.6 + length / 2],
                            ])}
                          />
                        ))}
                      </g>
                    ) : null}
                  </g>
                );
              })}
              <path
                d={path(
                  pixelCorners.map((corner) => add(point, corner)),
                  true
                )}
                fill="var(--background)"
                stroke={`color-mix(in oklch, var(--accent) ${state.pixel * 100}%, var(--text-secondary))`}
                strokeWidth={1.6}
                strokeLinejoin="round"
                opacity={state.viewing}
              />
              <path
                d={path(
                  pixelCorners.map((corner) => add(point, corner)),
                  true
                )}
                fill="var(--accent)"
                opacity={state.result * 0.65}
              />
              <g opacity={state.viewing}>
                <path
                  d={incoming.shaft}
                  stroke="var(--text-secondary)"
                  strokeWidth={1.5}
                />
                <path d={incoming.head} fill="var(--text-secondary)" />
              </g>
              <path
                d={path([point, add(point, [0, 1.25, 0])])}
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth={1}
                strokeDasharray="1 4"
                strokeLinecap="round"
                opacity={state.hitLabel}
              />
              <g opacity={state.reflection}>
                <path d={reflected.shaft} stroke={rayColor} strokeWidth={1.5} />
                <path d={reflected.head} fill={rayColor} />
                {hit ? (
                  <circle
                    cx={hx}
                    cy={hy}
                    r={4}
                    fill={rayColor}
                    opacity={state.reflection}
                  />
                ) : null}
              </g>
              {[lensFaces, viewerFaces].map((faces, index) => (
                <g key={index}>
                  {faces.map((face, i) => (
                    <path
                      key={i}
                      d={path(face, true)}
                      fill="var(--background)"
                    />
                  ))}
                  <path
                    d={outline(faces)}
                    fill="none"
                    stroke="var(--text-secondary)"
                    strokeWidth={1.2}
                    strokeLinejoin="round"
                  />
                </g>
              ))}
              <text
                {...label(
                  viewer,
                  'Viewer',
                  [
                    0,
                    Math.min(
                      ...viewerFaces.flat().map((vertex) => project(vertex)[1])
                    ) -
                      project(viewer)[1] -
                      12,
                  ],
                  true
                )}
                fill="var(--text-secondary)"
              >
                Viewer
              </text>
              <g
                transform={`translate(${project(point)[0]} ${Math.max(...pixelCorners.map((corner) => project(add(point, corner))[1])) + 18})`}
                textAnchor="middle"
                fill="var(--accent)"
              >
                <text opacity={state.pixelLabel}>Surface pixel</text>
                <text y={17} opacity={state.result}>
                  (with reflection)
                </text>
              </g>
              <text
                {...label(tip, 'Surface hit', [0, -20], true)}
                fill="var(--accent)"
                opacity={hit ? state.hitLabel : 0}
              >
                Surface hit
              </text>
            </>
          );
        }}
      </Diagram>
      <Slider
        id={`${id}-viewer`}
        label="Viewer position"
        hideDots
        min={1}
        max={2}
        step={0.01}
        value={distance}
        onChange={setDistance}
      />
    </Root>
  );
}
