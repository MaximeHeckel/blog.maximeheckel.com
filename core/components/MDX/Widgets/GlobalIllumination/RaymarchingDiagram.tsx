import { ReactNode, useId } from 'react';

import { Diagram } from './Diagram';
import {
  Point3,
  Viewport,
  add,
  arc,
  arrowPaths,
  createProjection,
  mix,
  multiply,
  visibleBoxFaces,
} from './geometry';
import {
  CAMERA,
  CUBE,
  RAYS,
  RaymarchingState,
  SLAB,
  STEPS,
  SURFACE_POINT,
} from './raymarchingScene';

export interface RaymarchingDiagramProps {
  className?: string;
}

const emphasis = (amount: number) =>
  `color-mix(in oklch, var(--accent) ${Math.max(0, Math.min(1, amount)) * 100}%, var(--text-secondary))`;

/** The SVG's order is deliberate: solids → pixel → rays → markers → labels. */
function RaymarchingScene({
  state,
  viewport,
}: {
  state: RaymarchingState;
  viewport: Viewport;
}) {
  const hatchId = useId();
  const { eye, project, path, outline, label } = createProjection(viewport, {
    ...CAMERA,
    elevation: state.cameraElevation,
    zoom: state.cameraZoom,
    target: [state.cameraTargetX, state.cameraTargetY, state.cameraTargetZ],
  });
  const pixelColor = emphasis(state.pixelEmphasis);
  const hemisphereColor = emphasis(state.hemisphereEmphasis);
  const lightColor = emphasis(state.lightEmphasis);
  const pixel = add(SURFACE_POINT, [0, 0.008, 0]);
  const pixelCorners: Point3[] = [
    [-0.17, 0, -0.17],
    [0.17, 0, -0.17],
    [0.17, 0, 0.17],
    [-0.17, 0, 0.17],
  ];
  const pixelLabel = add(pixel, [-0.55, 0, 0.55]);
  const source = RAYS.find((ray) => ray.hit)?.hit;
  const markers: ReactNode[] = [];

  const rays = RAYS.map((ray) => {
    if (state.raysVisibility < 0.001) return null;

    const length = 0.72 + (ray.length - 0.72) * state.marchProgress;
    const tip = add(SURFACE_POINT, multiply(ray.direction, length));
    const color = emphasis(
      state.rayEmphasis + (ray.hit ? state.lightEmphasis : 0)
    );
    const opacity =
      state.raysVisibility * (ray.hit ? 1 : 1 - state.gatherProgress);
    const returning = ray.hit !== null && state.gatherProgress > 0.5;
    const reachedSurface = ray.hit !== null && state.marchProgress > 0.97;
    const start = project(returning ? tip : SURFACE_POINT);
    const end = project(returning ? SURFACE_POINT : tip);
    const arrow = arrowPaths(start, end, returning || !reachedSurface);

    // Queue markers separately so every dot faces the viewer above every shaft.
    if (state.marchProgress > 0.01 && state.markerVisibility > 0.001) {
      for (let distance = 0.45; distance < length - 0.18; distance += 0.45) {
        const [cx, cy] = project(
          add(SURFACE_POINT, multiply(ray.direction, distance))
        );
        markers.push(
          <circle
            key={`${ray.id}-march-${distance}`}
            cx={cx}
            cy={cy}
            r={1.25}
            fill={color}
            opacity={state.markerVisibility * opacity}
          />
        );
      }
    }

    if (reachedSurface) {
      const [cx, cy] = project(tip);
      markers.push(
        <circle
          key={`${ray.id}-hit`}
          cx={cx}
          cy={cy}
          r={3.5}
          fill={color}
          stroke={color}
          strokeWidth={1.2}
          opacity={(state.marchProgress - 0.97) / 0.03}
        />
      );
    }

    if (ray.hit && state.gatherProgress > 0 && state.gatherProgress < 1) {
      const [cx, cy] = project(
        mix(ray.hit.point, SURFACE_POINT, state.gatherProgress)
      );
      markers.push(
        <circle
          key={`${ray.id}-gather`}
          cx={cx}
          cy={cy}
          r={3.5}
          fill={lightColor}
          stroke={lightColor}
          strokeWidth={1.2}
          opacity={Math.sin(state.gatherProgress * Math.PI)}
        />
      );
    }

    return (
      <g
        key={ray.id}
        data-ray={ray.id}
        data-hit={ray.hit !== null}
        opacity={opacity}
      >
        <path
          d={arrow.shaft}
          fill="none"
          stroke={color}
          strokeWidth={returning ? 1.7 : 1.2}
          strokeLinecap="butt"
        />
        {arrow.head ? <path d={arrow.head} fill={color} /> : null}
      </g>
    );
  });

  return (
    <>
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
            {faces.map((face, faceIndex) => {
              // Shade the same-facing side of both solids.
              const hatched = face.every((point) => point[2] === box.min[2]);

              return (
                <g key={faceIndex}>
                  <path d={path(face, true)} fill="var(--background)" />
                  {hatched ? (
                    <path d={path(face, true)} fill={`url(#${hatchId})`} />
                  ) : null}
                </g>
              );
            })}
            <path
              d={outline(faces)}
              fill="none"
              stroke="var(--gi-edge)"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      <g
        fill="none"
        stroke={hemisphereColor}
        strokeWidth={1.5}
        opacity={state.hemisphereVisibility}
      >
        {(['xz', 'yz', 'xy'] as const).map((plane) => (
          <path key={plane} d={path(arc(SURFACE_POINT, 0.85, plane))} />
        ))}
      </g>
      <path
        d={path([SURFACE_POINT, add(SURFACE_POINT, [0, 1.1, 0])])}
        fill="none"
        stroke={hemisphereColor}
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={state.normalVisibility * 0.6}
      />

      {/* Color is an illustrative highlight, not a computed radiance value. */}
      <path
        d={path(
          pixelCorners.map((corner) => add(pixel, corner)),
          true
        )}
        fill={pixelColor}
        fillOpacity={0.06 + state.shadeProgress * 0.65}
        stroke={pixelColor}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {rays}
      {markers}

      <text
        {...label(pixelLabel, 'Surface pixel', [3, 18], true)}
        fill={pixelColor}
        opacity={state.pixelEmphasis}
      >
        Surface pixel
      </text>
      <text
        {...label(pixelLabel, '(with indirect light)', [3, 35], true)}
        fill={pixelColor}
        opacity={state.shadeProgress}
      >
        (with indirect light)
      </text>
      <text
        {...label(add(SURFACE_POINT, [0, 1.25, 0]), 'Hemisphere', [18, -10])}
        fill={hemisphereColor}
        opacity={Math.max(0, (state.hemisphereVisibility - 0.8) * 5)}
      >
        Hemisphere
      </text>
      {source ? (
        <text
          {...label(
            mix(source.point, SURFACE_POINT, 0.7),
            'Reflected light',
            [16, -12]
          )}
          fill={lightColor}
          opacity={
            Math.max(0, (state.gatherProgress - 0.6) / 0.4) *
            (1 - state.shadeProgress)
          }
        >
          Reflected light
        </text>
      ) : null}
    </>
  );
}

export function RaymarchingDiagram({ className }: RaymarchingDiagramProps) {
  return (
    <Diagram
      label="Indirect light at one surface pixel"
      className={className}
      steps={STEPS}
    >
      {(state, viewport) => (
        <RaymarchingScene state={state} viewport={viewport} />
      )}
    </Diagram>
  );
}
