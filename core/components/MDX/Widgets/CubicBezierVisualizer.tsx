import {
  css,
  Button,
  Card,
  Flex,
  Grid,
  Icon,
  Switch,
  Tooltip,
} from '@maximeheckel/design-system';
import useInterval from '@theme/hooks/useInterval';
import { Drag } from '@visx/drag';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { HighlightedValue } from './Components';

const select = css({
  border: '1px solid var(--maximeheckel-colors-brand)',
  boxShadow: 'none',
  backgroundColor: 'var(--maximeheckel-colors-emphasis)',
  color: 'var(--maximeheckel-colors-brand)',
  height: '30px',
  borderRadius: 'var(--border-radius-0)',
  padding: '0px 8px 0px 8px',
  marginBottom: '32px',
  justifySelf: 'center',
  maxWidth: '400px',
  width: '100%',
});

type Point = {
  x: number;
  y: number;
};

interface CubicBezierVisualizerProps {
  editable?: boolean;
}

interface ChartProps extends CubicBezierVisualizerProps {
  width: number;
}

interface DragHandleProps {
  dimension: number;
  point: Point;
  originPoint: Point;
  scale: any;
  onDragStart: () => void;
  onDragMove: (point: Point) => void;
  onDragEnd: () => void;
}

type Time = number;

const x0 = 0;
const y0 = 0;

const x3 = 1;
const y3 = 1;

const easingControlPoints: Record<
  string,
  { x1: number; y1: number; x2: number; y2: number }
> = {
  ease: {
    x1: 0.25,
    y1: 0.1,
    x2: 0.25,
    y2: 1,
  },
  easein: {
    x1: 0.42,
    y1: 0,
    x2: 1,
    y2: 1,
  },
  easeout: {
    x1: 0,
    y1: 0,
    x2: 0.58,
    y2: 1,
  },
  easeinout: {
    x1: 0.42,
    y1: 0,
    x2: 0.58,
    y2: 1,
  },
  easeinback: {
    x1: 0.36,
    y1: 0,
    x2: 0.66,
    y2: -0.56,
  },
  easeoutback: {
    x1: 0.34,
    y1: 1.56,
    x2: 0.64,
    y2: 1,
  },
  easeinoutback: {
    x1: 0.68,
    y1: -0.6,
    x2: 0.32,
    y2: 1.6,
  },
  easeincirc: {
    x1: 0.55,
    y1: 0,
    x2: 1,
    y2: 0.45,
  },
  easeoutcirc: {
    x1: 0,
    y1: 0.55,
    x2: 0.45,
    y2: 1,
  },
  easeinoutcirc: {
    x1: 0.85,
    y1: 0,
    x2: 0.15,
    y2: 1,
  },
};

const options = [
  {
    name: 'Ease',
    value: 'ease',
  },
  {
    name: 'Ease in',
    value: 'easein',
  },
  {
    name: 'Ease out',
    value: 'easeout',
  },
  {
    name: 'Ease in out',
    value: 'easeinout',
  },
  {
    name: 'Ease in back',
    value: 'easeinback',
  },
  {
    name: 'Ease out back',
    value: 'easeoutback',
  },
  {
    name: 'Ease in out back',
    value: 'easeinoutback',
  },
  {
    name: 'Ease in circ',
    value: 'easeincirc',
  },
  {
    name: 'Ease out circ',
    value: 'easeoutcirc',
  },
  {
    name: 'Ease in out circ',
    value: 'easeinoutcirc',
  },
];

const cubicDerivative = (P1: Point, P2: Point) => {
  const y = (t: Time) =>
    3 * Math.pow(1 - t, 2) * (P1.y - y0) +
    6 * (1 - t) * t * (P2.y - P1.y) +
    3 * Math.pow(t, 2) * (y3 - P2.y);

  const x = (t: Time) =>
    3 * Math.pow(1 - t, 2) * (P1.x - x0) +
    6 * (1 - t) * t * (P2.x - P1.x) +
    3 * Math.pow(t, 2) * (x3 - P2.x);

  const res = [];

  for (let t = 0; t <= 1; t = t + 1 / 60) {
    const valX = x(t);
    const valY = y(t);
    res.push({ x: valX, y: valY });
  }

  return res;
};

const cubic = (P1: Point, P2: Point) => {
  const y = (t: Time) =>
    Math.pow(1 - t, 3) * y0 +
    3 * Math.pow(1 - t, 2) * t * P1.y +
    3 * (1 - t) * Math.pow(t, 2) * P2.y +
    Math.pow(t, 3) * y3;

  const x = (t: Time) =>
    Math.pow(1 - t, 3) * x0 +
    3 * Math.pow(1 - t, 2) * t * P1.x +
    3 * (1 - t) * Math.pow(t, 2) * P2.x +
    Math.pow(t, 3) * x3;

  const res = [];

  for (let t = 0; t <= 1; t = t + 1 / 60) {
    const valX = x(t);
    const valY = y(t);
    res.push({ x: valX, y: valY });
  }
  res.push({ x: 1, y: 1 });

  return res;
};

let scrollable = true;

const listener = function (e: Event) {
  if (!scrollable) {
    e.preventDefault();
  }
};

const DragHandle = (props: DragHandleProps) => {
  const {
    dimension,
    point,
    originPoint,
    scale,
    onDragStart,
    onDragEnd,
    onDragMove,
  } = props;

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    document.addEventListener('touchmove', listener, {
      passive: false,
    });

    document.addEventListener('touchmove', listener, {
      passive: false,
    });
  }, []);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <Drag
      width={dimension}
      height={dimension}
      x={scale(point.x)}
      y={scale(point.y)}
      onDragStart={onDragStart}
      onDragMove={(dragData) => {
        const newX = Math.abs((dragData.x || 0) + dragData.dx);
        const newY = Math.abs((dragData.y || 0) + dragData.dy);

        onDragMove({ x: newX, y: newY });
      }}
      onDragEnd={onDragEnd}
    >
      {({ dragStart, dragEnd, dragMove, isDragging, x, y, dx, dy }) => (
        <>
          <line
            x1={scale(originPoint.x)}
            y1={scale(originPoint.y)}
            x2={x}
            y2={y}
            fill="hsl(var(--palette-gray-50))"
            stroke="hsl(var(--palette-gray-50))"
            strokeWidth={3}
            style={{
              opacity: 0.5,
            }}
          />
          <circle
            cx={x}
            cy={y}
            r={10}
            fill="hsl(var(--palette-gray-50))"
            stroke={
              isDragging
                ? 'var(--maximeheckel-colors-brand)'
                : 'var(--maximeheckel-colors-foreground)'
            }
            strokeWidth={2}
            transform={`translate(${dx}, ${dy})`}
            onMouseMove={dragMove}
            onMouseUp={dragEnd}
            onMouseDown={dragStart}
            onTouchStart={(e) => {
              scrollable = false;
              dragStart(e);
            }}
            onTouchMove={dragMove}
            onTouchEnd={(e) => {
              scrollable = true;
              dragEnd(e);
            }}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', opacity: 1 }}
          />
        </>
      )}
    </Drag>
  );
};

const Chart = (props: ChartProps) => {
  /**
   * We use the same dimension for both X and Y axis as the chart is square
   */
  const { width, editable } = props;

  const [P1, setP1] = React.useState({ x: 0.16, y: 0.69 });
  const [P2, setP2] = React.useState({ x: 0.72, y: 0.22 });
  const [type, setType] = React.useState(options[0].value);

  const [activeStepIndex, setActiveStepIndex] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showHandles, setShowHandles] = React.useState(true);
  const [showTrace, setShowTrace] = React.useState(!editable);
  const [traceOnChart, setTraceOnChart] = React.useState(editable);
  const [paused, setPaused] = React.useState(false);
  const [showDerivative, setShowDerivative] = React.useState(false);

  const dimension = editable ? width - 100 : width / 1.5;

  const data = React.useMemo(() => cubic(P1, P2), [P1, P2]);
  const speed = React.useMemo(() => cubicDerivative(P1, P2), [P1, P2]);

  const getX = (d: Point) => d.x;
  const getY = (d: Point) => d.y;
  const repeat = () => setActiveStepIndex(0);

  const speedScale = scaleLinear({
    domain: [0, 2.5],
    range: [0, dimension],
    nice: true,
  });

  /**
   * We use the same scale for both X and Y chart axis
   */
  const scale = scaleLinear({
    domain: [0, 1],
    range: [0, dimension],
    nice: true,
  });

  React.useEffect(() => {
    if (!editable) {
      setP1({
        x: easingControlPoints[type].x1,
        y: easingControlPoints[type].y1,
      });
      setP2({
        x: easingControlPoints[type].x2,
        y: easingControlPoints[type].y2,
      });
    }
  }, [editable, type]);

  useInterval(() => {
    if (paused) {
      return;
    }

    if (activeStepIndex < 60) {
      setActiveStepIndex((prev) => prev + 1);
    }
  }, 1000 / 60);

  // When SSR kicks in the width of the parent is set to 0
  if (width === 0) {
    return null;
  }

  return (
    <Grid gap={7}>
      {!editable ? (
        <select
          id="ease-type"
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            setActiveStepIndex(0);
          }}
          className={select()}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      ) : null}
      <svg
        width={dimension}
        height={dimension}
        style={{ overflow: 'visible', justifySelf: 'center' }}
      >
        <defs>
          <linearGradient id="motion" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="20%"
              stopColor="hsl(var(--palette-pink-30))"
              stopOpacity={1}
            />
            <stop
              offset="99%"
              stopColor="hsl(var(--palette-indigo-30))"
              stopOpacity={1}
            />
          </linearGradient>
          <linearGradient id="speed" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="1%"
              stopColor="hsl(var(--palette-green-50))"
              stopOpacity={1}
            />
            <stop
              offset="99%"
              stopColor="hsl(var(--palette-orange-50))"
              stopOpacity={1}
            />
          </linearGradient>
        </defs>
        <Group>
          <line
            x1={scale(0)}
            y1={scale(0)}
            x2={scale(1)}
            y2={scale(1)}
            fill="hsl(var(--palette-gray-50))"
            stroke="hsl(var(--palette-gray-50))"
            strokeWidth={6}
            strokeLinecap="round"
            style={{
              opacity: 0.2,
            }}
          />
          <LinePath
            data={data}
            x={(d) => scale(getX(d))}
            y={(d) => scale(getY(d))}
          >
            {({ path }) => {
              const d = path(data) || '';

              return (
                <motion.path
                  d={d}
                  strokeWidth={6}
                  strokeOpacity={0.8}
                  strokeLinecap="round"
                  fill="none"
                  stroke="url(#motion)"
                  initial={{
                    d,
                  }}
                  animate={{
                    d,
                  }}
                />
              );
            }}
          </LinePath>
          <AnimatePresence>
            {showDerivative ? (
              <>
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LinePath
                    data={speed}
                    x={(d) => speedScale(getX(d))}
                    y={(d) => speedScale(getY(d))}
                    strokeWidth={6}
                    strokeOpacity={0.8}
                    strokeLinecap="round"
                    fill="none"
                    stroke="url(#speed)"
                  />
                </motion.g>
                <circle
                  cx={0}
                  cy={0}
                  r={5}
                  fill="var(--maximeheckel-colors-brand)"
                  stroke="var(--maximeheckel-colors-brand)"
                  transform={`translate(${speedScale(
                    speed[activeStepIndex]?.x
                  )}, ${speedScale(speed[activeStepIndex]?.y)})`}
                />
              </>
            ) : null}
          </AnimatePresence>
          <circle
            cx={0}
            cy={0}
            r={5}
            fill="var(--maximeheckel-colors-brand)"
            stroke="var(--maximeheckel-colors-brand)"
            transform={`translate(${scale(data[activeStepIndex]?.x)}, ${scale(
              data[activeStepIndex]?.y
            )})`}
          />
          <AnimatePresence>
            {showTrace ? (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {data.map((step, index) =>
                  index % 1 ? null : (
                    <motion.circle
                      cy={scale(step.y)}
                      r={5}
                      key={step.x}
                      fill="var(--maximeheckel-colors-brand)"
                      initial={{
                        cx: scale(1.1), //traceOnChart ? scale(1.1) : scale(step.x),
                        opacity: 0,
                      }}
                      animate={{
                        cx: traceOnChart ? scale(step.x) : scale(1.1),
                        opacity:
                          index === activeStepIndex
                            ? 1
                            : index > activeStepIndex
                            ? 0
                            : 0.4,
                      }}
                      transition={{
                        opacity: { ease: 'linear', duration: 0 },
                        cx: {
                          ease: 'easeInOut',
                          duration: isDragging ? 0 : 0.8,
                        },
                      }}
                    />
                  )
                )}
              </motion.g>
            ) : null}
          </AnimatePresence>
          {showHandles && editable ? (
            <>
              <DragHandle
                dimension={dimension}
                scale={scale}
                point={P1}
                originPoint={{ x: x0, y: y0 }}
                onDragStart={() => {
                  setShowTrace(false);
                  setIsDragging(true);
                }}
                onDragMove={(point) => {
                  setP1((prev) => {
                    return {
                      x: (prev.x * point.x) / scale(prev.x + 0.01),
                      y: (prev.y * point.y) / scale(prev.y + 0.01),
                    };
                  });
                }}
                onDragEnd={() => {
                  setShowTrace(true);
                  setTimeout(() => setIsDragging(false), 100);
                  setActiveStepIndex(0);
                }}
              />
              <DragHandle
                dimension={dimension}
                scale={scale}
                point={P2}
                originPoint={{ x: x3, y: y3 }}
                onDragStart={() => {
                  setShowTrace(false);
                  setIsDragging(true);
                }}
                onDragMove={(point) => {
                  setP2((prev) => {
                    return {
                      x: (prev.x * point.x) / scale(prev.x + 0.01),
                      y: (prev.y * point.y) / scale(prev.y + 0.01),
                    };
                  });
                }}
                onDragEnd={() => {
                  setShowTrace(true);
                  setTimeout(() => setIsDragging(false), 100);
                  setActiveStepIndex(0);
                }}
              />
            </>
          ) : null}
        </Group>
      </svg>

      <Grid
        gap={2}
        css={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(0px, 1fr))',
          marginTop: 'var(--space-4)',
        }}
      >
        <Flex justifyContent="center">
          P1{' '}
          <HighlightedValue>
            x:{P1.x.toFixed(2)} y:{P1.y.toFixed(2)}
          </HighlightedValue>
        </Flex>
        <Flex justifyContent="center">
          P2{' '}
          <HighlightedValue>
            x:{P2.x.toFixed(2)} y:{P2.y.toFixed(2)}
          </HighlightedValue>
        </Flex>
      </Grid>
      {editable ? (
        <Grid
          gap={2}
          justify="center"
          css={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          }}
        >
          <Switch
            id="show-handles-switch"
            aria-label="Handles"
            label="Handles"
            toggled={showHandles}
            onChange={() => setShowHandles((prev) => !prev)}
          />
          <Switch
            id="show-points-switch"
            aria-label="Points"
            label="Points"
            toggled={showTrace}
            onChange={() => setShowTrace((prev) => !prev)}
          />
          <Switch
            id="project-points-switch"
            aria-label="Project Points"
            label="Project Points"
            disabled={!showTrace}
            toggled={!traceOnChart}
            onChange={() => setTraceOnChart((prev) => !prev)}
          />
          <Switch
            id="show-derivative-switch"
            aria-label="Show Derivative"
            label="Derivative"
            toggled={showDerivative}
            onChange={() => setShowDerivative((prev) => !prev)}
          />
        </Grid>
      ) : null}
      <Flex gap={4} justifyContent="center">
        <Tooltip id="playpauseButton" content={paused ? 'Play' : 'Pause'}>
          <Button
            aria-label={paused ? 'Play' : 'Pause'}
            aria-describedby="playpauseButton"
            variant="icon"
            icon={paused ? <Icon.Play /> : <Icon.Pause />}
            onClick={() => setPaused((prev) => !prev)}
          />
        </Tooltip>
        <Tooltip id="repeatButton" content="Repeat">
          <Button
            aria-label="Repeat"
            aria-describedby="repeatButton"
            variant="icon"
            icon={<Icon.Repeat />}
            onClick={repeat}
          />
        </Tooltip>
      </Flex>
    </Grid>
  );
};

const CubicBezierVisualizer = (props: CubicBezierVisualizerProps) => {
  const { editable } = props;

  return (
    <Card
      css={{
        marginBottom: '2.25rem',

        '@media (max-width: 750px)': {
          /**
           * Make it fullbleed!
           */
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          borderRadius: '0px',
        },
      }}
      title="Cubic Bézier Visualizer"
    >
      <Card.Body>
        <ParentSize>
          {({ width }) => <Chart width={width} editable={editable} />}
        </ParentSize>
      </Card.Body>
    </Card>
  );
};

export default CubicBezierVisualizer;
