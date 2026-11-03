import { useId } from 'react';

import { Diagram } from './Diagram';
import {
  Point3,
  add,
  arrowPaths,
  createProjection,
  dot,
  multiply,
  visibleBoxFaces,
} from './geometry';
import {
  BOUNCE_HITS,
  BOUNCE_LIGHT,
  BOUNCE_PATH,
  BOUNCE_SPHERE,
  BOUNCE_STEPS,
  sphereShadowPath,
  growingRay,
} from './lightBounceScene';
import { CAMERA, CUBE, SLAB } from './raymarchingScene';

export interface LightBounceDiagramProps {
  className?: string;
}

export default function LightBounceDiagram({
  className,
}: LightBounceDiagramProps) {
  const id = useId();
  return (
    <Diagram
      label="Light traveling through multiple diffuse bounces"
      className={className}
      steps={BOUNCE_STEPS}
    >
      {(state, viewport) => {
        const { project, path, outline, eye, label } = createProjection(
          viewport,
          {
            ...CAMERA,
            target: [-0.35, 0.6, 0],
            span: [9.4, 7.2],
          }
        );
        const { center, radius } = BOUNCE_SPHERE;
        const [sx, sy] = project(center);
        const edge = project(
          add(center, [
            Math.sin((CAMERA.azimuth * Math.PI) / 180) * radius,
            0,
            -Math.cos((CAMERA.azimuth * Math.PI) / 180) * radius,
          ])
        );
        const screenRadius = Math.hypot(edge[0] - sx, edge[1] - sy);
        const [lx, ly] = project(BOUNCE_LIGHT);
        const azimuth = (CAMERA.azimuth * Math.PI) / 180;
        const elevation = (CAMERA.elevation * Math.PI) / 180;
        const right: Point3 = [Math.sin(azimuth), 0, -Math.cos(azimuth)];
        const up: Point3 = [
          -Math.cos(azimuth) * Math.sin(elevation),
          Math.cos(elevation),
          -Math.sin(azimuth) * Math.sin(elevation),
        ];
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
                <path d="M0 0V6" stroke="var(--gi-edge)" strokeWidth={0.75} />
              </pattern>
              <clipPath id={`${id}-sphere`}>
                <circle cx={sx} cy={sy} r={screenRadius} />
              </clipPath>
            </defs>
            {[SLAB, CUBE].map((box, index) => {
              const faces = visibleBoxFaces(box, eye);
              return (
                <g key={index}>
                  {faces.map((face, i) => (
                    <g key={i}>
                      <path d={path(face, true)} fill="var(--background)" />
                      {face.every((point) => point[2] === box.min[2]) ? (
                        <path d={path(face, true)} fill={`url(#${id}-hatch)`} />
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
            <circle cx={sx} cy={sy} r={screenRadius} fill="var(--background)" />
            <g clipPath={`url(#${id}-sphere)`}>
              <path
                d={sphereShadowPath(eye, right, up, sx, sy, screenRadius)}
                fill={`url(#${id}-hatch)`}
              />
              {(['xy', 'xz'] as const).flatMap((plane) =>
                Array.from({ length: 64 }, (_, i) => {
                  const normal = (angle: number): Point3 =>
                    plane === 'xy'
                      ? [Math.cos(angle), Math.sin(angle), 0]
                      : [Math.cos(angle), 0, Math.sin(angle)];
                  const from = normal((i * Math.PI) / 32);
                  const to = normal(((i + 1) * Math.PI) / 32);
                  const front = dot(from, eye) >= 0;
                  return (
                    <path
                      key={`${plane}-${i}`}
                      d={path([
                        add(center, multiply(from, radius)),
                        add(center, multiply(to, radius)),
                      ])}
                      fill="none"
                      stroke="var(--gi-edge)"
                      strokeWidth={0.75}
                      opacity={front ? 0.7 : 0.25}
                      strokeDasharray={front ? undefined : '1 3'}
                    />
                  );
                })
              )}
            </g>
            <circle
              cx={sx}
              cy={sy}
              r={screenRadius}
              fill="none"
              stroke="var(--gi-edge)"
              strokeWidth={1}
            />
            <g
              transform={`translate(${lx} ${ly})`}
              fill="none"
              stroke="#FFD28D"
              strokeWidth={1}
            >
              <circle r={6} />
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                  <path
                    key={i}
                    d={`M${Math.cos(a) * 10} ${Math.sin(a) * 10}l${Math.cos(a) * 4} ${Math.sin(a) * 4}`}
                  />
                );
              })}
            </g>
            <text {...label(BOUNCE_LIGHT, 'Light', [20, -4])} fill="#FFD28D">
              Light
            </text>
            {BOUNCE_HITS.map(({ point }, index) => {
              const progress = Math.min(1, Math.max(0, state.progress - index));
              if (progress === 0) return null;
              const { start, end } = growingRay(
                project(BOUNCE_PATH[index]),
                project(point),
                progress,
                index === 0 ? 16 : 8
              );
              const ray = arrowPaths(start, end);
              const color = index === 0 ? '#FFD28D' : 'var(--accent)';
              const [px, py] = project(point);
              return (
                <g key={index}>
                  <path
                    d={ray.shaft}
                    stroke={color}
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <path d={ray.head} fill={color} />
                  <g opacity={Math.max(0, (progress - 0.9) * 10)}>
                    <circle
                      cx={px}
                      cy={py}
                      r={5}
                      fill="var(--background)"
                      stroke={color}
                      strokeWidth={1.2}
                    />
                    <circle cx={px} cy={py} r={2} fill={color} />
                  </g>
                </g>
              );
            })}
          </>
        );
      }}
    </Diagram>
  );
}
