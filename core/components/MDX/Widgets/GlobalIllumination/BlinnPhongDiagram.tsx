import { useId } from 'react';

import { Diagram } from './Diagram';
import {
  LIGHT,
  COMPARISON_POINTS,
  LIGHTING_STEPS,
  LIGHT_POSITION,
  lightingProjection,
} from './blinnPhongScene';
import { Point3, add, arrowPaths, dot, multiply } from './geometry';

export interface BlinnPhongDiagramProps {
  className?: string;
}

export default function BlinnPhongDiagram({
  className,
}: BlinnPhongDiagramProps) {
  const id = useId();
  return (
    <Diagram
      label="Comparing surface normals and light direction"
      className={className}
      steps={LIGHTING_STEPS}
    >
      {(state, viewport) => {
        const { project, path, eye, label } = lightingProjection(
          state,
          viewport
        );
        const [cx, cy] = project([0, 0, 0]);
        // Orthographic sphere silhouette stays circular as its surface rotates.
        const azimuth = (state.azimuth * Math.PI) / 180;
        const radius = Math.hypot(
          ...project([Math.sin(azimuth), 0, -Math.cos(azimuth)]).map(
            (v, i) => v - [cx, cy][i]
          )
        );
        const lightScreen = project(LIGHT);
        const lightDepth = dot(LIGHT, eye);
        const rotation = Math.atan2(cy - lightScreen[1], cx - lightScreen[0]);
        // The terminator is the projected great circle perpendicular to L.
        const shadow =
          Array.from({ length: 65 }, (_, i) => {
            const angle = -Math.PI / 2 + (i * Math.PI) / 64;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
          })
            .concat(
              Array.from({ length: 65 }, (_, i) => {
                const angle = Math.PI / 2 - (i * Math.PI) / 64;
                return [
                  radius * lightDepth * Math.cos(angle),
                  radius * Math.sin(angle),
                ];
              })
            )
            // Project the boundary into screen space so the hatch pattern stays fixed.
            .map(([x, y], i) => {
              const screenX =
                cx + x * Math.cos(rotation) - y * Math.sin(rotation);
              const screenY =
                cy + x * Math.sin(rotation) + y * Math.cos(rotation);
              return `${i === 0 ? 'M' : 'L'}${screenX.toFixed(3)} ${screenY.toFixed(3)}`;
            })
            .join(' ') + 'Z';
        const light = LIGHT_POSITION;
        const [lx, ly] = project(light);
        const arrow = (from: Point3, to: Point3, color: string) => {
          const paths = arrowPaths(project(from), project(to));
          return (
            <g fill={color} stroke={color} strokeWidth={1.3}>
              <path d={paths.shaft} fill="none" />
              <path d={paths.head} stroke="none" />
            </g>
          );
        };
        return (
          <g>
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
            </defs>
            <circle cx={cx} cy={cy} r={radius} fill="var(--background)" />
            <g>
              <path d={shadow} fill="var(--background)" />
              <path
                d={shadow}
                fill={`url(#${id}-hatch)`}
                stroke="var(--gi-edge)"
                strokeWidth={0.75}
              />
            </g>
            <g fill="none" stroke="var(--gi-edge)" strokeWidth={0.75}>
              {(['xy', 'xz', 'yz'] as const).flatMap((plane) =>
                Array.from({ length: 96 }, (_, i) => {
                  const vertex = (angle: number): Point3 =>
                    plane === 'xy'
                      ? [Math.cos(angle), Math.sin(angle), 0]
                      : plane === 'xz'
                        ? [Math.cos(angle), 0, Math.sin(angle)]
                        : [0, Math.cos(angle), Math.sin(angle)];
                  const from = vertex((i * Math.PI) / 48);
                  const to = vertex(((i + 1) * Math.PI) / 48);
                  const front = dot(from, eye) >= 0;
                  return (
                    <path
                      key={`${plane}-${i}`}
                      d={path([from, to])}
                      opacity={front ? 0.65 : 0.2}
                      strokeDasharray={front ? undefined : '1 3'}
                    />
                  );
                })
              )}
            </g>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--gi-edge)"
              strokeWidth={1}
            />
            <g
              transform={`translate(${lx} ${ly}) scale(0.75)`}
              opacity={1 - state.close}
              fill="none"
              stroke="#FFD28D"
              strokeWidth={1}
            >
              <circle r={7} />
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                  <path
                    key={i}
                    d={`M${Math.cos(a) * 11} ${Math.sin(a) * 11}l${Math.cos(a) * 5} ${Math.sin(a) * 5}`}
                  />
                );
              })}
            </g>
            <text
              opacity={1 - state.close}
              x={lx + 19}
              y={ly}
              dominantBaseline="middle"
              fill="#FFD28D"
            >
              Light
            </text>
            {COMPARISON_POINTS.map(({ id: name, normal, diffuse }, index) => {
              const visibility = Math.min(1, Math.max(0, dot(normal, eye) * 8));
              const emphasis = index === 0 ? 1 - state.focus : state.focus;
              const normalTip = multiply(normal, 1.7);
              const lightTip = add(normal, multiply(LIGHT, 1));
              const [px, py] = project(normal);
              const aligned = name === 'A';
              return (
                <g key={name} opacity={visibility * (0.35 + emphasis * 0.65)}>
                  <circle
                    cx={px}
                    cy={py}
                    r={8}
                    fill="var(--accent)"
                    fillOpacity={0.08 + diffuse * 0.3}
                    stroke="var(--accent)"
                  />
                  <g>
                    {arrow(normal, lightTip, '#FFD28D')}
                    <text
                      {...label(lightTip, 'L', aligned ? [4, -10] : [-12, -12])}
                      fill="#FFD28D"
                    >
                      L
                    </text>
                  </g>
                  {arrow(normal, normalTip, 'var(--accent)')}
                  <circle cx={px} cy={py} r={2.5} fill="var(--accent)" />
                  <text
                    {...label(normal, name, [-18, 12])}
                    fill="var(--accent)"
                  >
                    {name}
                  </text>
                  <text
                    {...label(normalTip, 'N', aligned ? [-15, 3] : [8, -12])}
                    fill="var(--accent)"
                  >
                    N
                  </text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Diagram>
  );
}
