import {
  Button,
  Card,
  Flex,
  Icon,
  Range,
  Tooltip,
} from '@maximeheckel/design-system';
import useInterval from '@theme/hooks/useInterval';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import React from 'react';
import { HighlightedValue } from './Components';

type ChartType = 'linear' | 'quadratic' | 'cubic';

type Point = {
  x: number;
  y: number;
};

type Time = number;

interface CurveProps {
  activeStepIndex: number;
  scale: any;
}

interface ChartProps {
  width: number;
  type: ChartType;
}

interface BezierCurvesProps {
  type: ChartType;
}

const lerp = (P0: Point, P1: Point) => {
  const x0 = P0.x;
  const y0 = P0.y;

  const x1 = P1.x;
  const y1 = P1.y;

  const y = (t: Time) => (1 - t) * y0 + t * y1;
  const x = (t: Time) => (1 - t) * x0 + t * x1;

  const res = [];

  for (let t = 0; t <= 1; t = t + 1 / 60) {
    const valX = x(t);
    const valY = y(t);
    res.push({ x: valX, y: valY });
  }
  res.push({ x: x1, y: y1 });

  return res;
};

const quadratic = (P0: Point, P1: Point, P2: Point) => {
  const x0 = P0.x;
  const y0 = P0.y;

  const x1 = P1.x;
  const y1 = P1.y;

  const x2 = P2.x;
  const y2 = P2.y;

  const x = (t: Time) =>
    Math.pow(1 - t, 2) * x0 + 2 * (1 - t) * t * x1 + Math.pow(t, 2) * x2;

  const y = (t: Time) =>
    Math.pow(1 - t, 2) * y0 + 2 * (1 - t) * t * y1 + Math.pow(t, 2) * y2;

  const res = [];

  // Get all the points for a transition at 60 frames per second that lasts 1s
  for (let t = 0; t <= 1; t = t + 1 / 60) {
    const valX = x(t);
    const valY = y(t);
    res.push({ x: valX, y: valY });
  }
  res.push({ x: 1, y: 0 });

  return res;
};

const cubic = (P0: Point, P1: Point, P2: Point, P3: Point) => {
  const x0 = P0.x;
  const y0 = P0.y;

  const x1 = P1.x;
  const y1 = P1.y;

  const x2 = P2.x;
  const y2 = P2.y;

  const x3 = P3.x;
  const y3 = P3.y;

  const y = (t: Time) =>
    Math.pow(1 - t, 3) * y0 +
    3 * Math.pow(1 - t, 2) * t * y1 +
    3 * (1 - t) * Math.pow(t, 2) * y2 +
    Math.pow(t, 3) * y3;

  const x = (t: Time) =>
    Math.pow(1 - t, 3) * x0 +
    3 * Math.pow(1 - t, 2) * t * x1 +
    3 * (1 - t) * Math.pow(t, 2) * x2 +
    Math.pow(t, 3) * x3;

  const res = [];

  for (let t = 0; t <= 1; t = t + 1 / 60) {
    const valX = x(t);
    const valY = y(t);
    res.push({ x: valX, y: valY });
  }
  res.push({ x: 1, y: 0 });

  return res;
};

const Cubic = (props: CurveProps) => {
  const { scale, activeStepIndex } = props;

  const getX = (d: Point) => d.x;
  const getY = (d: Point) => d.y;

  const x0 = 0;
  const y0 = 1;

  const x1 = 0.25;
  const y1 = 0.25;

  const x2 = 0.75;
  const y2 = 0.75;

  const x3 = 1;
  const y3 = 0;

  const data = React.useMemo(
    () =>
      cubic(
        { x: x0, y: y0 },
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 }
      ),
    []
  );

  const lerp1 = React.useMemo(
    () => lerp({ x: x0, y: y0 }, { x: x1, y: y1 }),
    []
  );
  const lerp2 = React.useMemo(
    () => lerp({ x: x1, y: y1 }, { x: x2, y: y2 }),
    []
  );
  const lerp3 = React.useMemo(
    () => lerp({ x: x2, y: y2 }, { x: x3, y: y3 }),
    []
  );
  const lerp4 = lerp(
    { x: lerp1[activeStepIndex]?.x, y: lerp1[activeStepIndex]?.y },
    { x: lerp2[activeStepIndex]?.x, y: lerp2[activeStepIndex]?.y }
  );

  const lerp5 = lerp(
    { x: lerp2[activeStepIndex]?.x, y: lerp2[activeStepIndex]?.y },
    { x: lerp3[activeStepIndex]?.x, y: lerp3[activeStepIndex]?.y }
  );

  return (
    <Group>
      <line
        x1={scale(x0)}
        y1={scale(y0)}
        x2={scale(x1)}
        y2={scale(y1)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <line
        x1={scale(x1)}
        y1={scale(y1)}
        x2={scale(x2)}
        y2={scale(y2)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <line
        x1={scale(x1)}
        y1={scale(y1)}
        x2={scale(x2)}
        y2={scale(y2)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <line
        x1={scale(x2)}
        y1={scale(y2)}
        x2={scale(x3)}
        y2={scale(y3)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
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
        strokeWidth={6}
        strokeOpacity={0.8}
        strokeLinecap="round"
        fill="none"
        stroke="url(#hr)"
      />
      <line
        x1={scale(lerp1[activeStepIndex]?.x)}
        y1={scale(lerp1[activeStepIndex]?.y)}
        x2={scale(lerp2[activeStepIndex]?.x)}
        y2={scale(lerp2[activeStepIndex]?.y)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <line
        x1={scale(lerp2[activeStepIndex]?.x)}
        y1={scale(lerp2[activeStepIndex]?.y)}
        x2={scale(lerp3[activeStepIndex]?.x)}
        y2={scale(lerp3[activeStepIndex]?.y)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <line
        x1={scale(lerp4[activeStepIndex]?.x)}
        y1={scale(lerp4[activeStepIndex]?.y)}
        x2={scale(lerp5[activeStepIndex]?.x)}
        y2={scale(lerp5[activeStepIndex]?.y)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="hsl(var(--palette-red-50))"
        stroke="hsl(var(--palette-red-50))"
        strokeWidth={3}
        transform={`translate(${scale(lerp1[activeStepIndex]?.x)}, ${scale(
          lerp1[activeStepIndex]?.y
        )})`}
      />
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="hsl(var(--palette-red-50))"
        stroke="hsl(var(--palette-red-50))"
        strokeWidth={3}
        transform={`translate(${scale(lerp2[activeStepIndex]?.x)}, ${scale(
          lerp2[activeStepIndex]?.y
        )})`}
      />
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="hsl(var(--palette-red-50))"
        stroke="hsl(var(--palette-red-50))"
        strokeWidth={3}
        transform={`translate(${scale(lerp3[activeStepIndex]?.x)}, ${scale(
          lerp3[activeStepIndex]?.y
        )})`}
      />
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="hsl(var(--palette-green-50))"
        stroke="hsl(var(--palette-green-50))"
        strokeWidth={3}
        transform={`translate(${scale(lerp4[activeStepIndex]?.x)}, ${scale(
          lerp4[activeStepIndex]?.y
        )})`}
      />
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="hsl(var(--palette-green-50))"
        stroke="hsl(var(--palette-green-50))"
        strokeWidth={3}
        transform={`translate(${scale(lerp5[activeStepIndex]?.x)}, ${scale(
          lerp5[activeStepIndex]?.y
        )})`}
      />
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
    </Group>
  );
};

const Quadratic = (props: CurveProps) => {
  const { scale, activeStepIndex } = props;

  const getX = (d: Point) => d.x;
  const getY = (d: Point) => d.y;

  const x0 = 0;
  const y0 = 0;

  const x1 = 0.5;
  const y1 = 1;

  const x2 = 1;
  const y2 = 0;

  const data = React.useMemo(
    () => quadratic({ x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 }),
    []
  );

  const lerp1 = React.useMemo(
    () => lerp({ x: x0, y: y0 }, { x: x1, y: y1 }),
    []
  );
  const lerp2 = React.useMemo(
    () => lerp({ x: x1, y: y1 }, { x: x2, y: y2 }),
    []
  );

  return (
    <Group>
      <line
        x1={scale(x0)}
        y1={scale(y0)}
        x2={scale(x1)}
        y2={scale(y1)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <line
        x1={scale(x1)}
        y1={scale(y1)}
        x2={scale(x2)}
        y2={scale(y2)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <line
        x1={scale(x1)}
        y1={scale(y1)}
        x2={scale(x2)}
        y2={scale(y2)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
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
        strokeWidth={6}
        strokeOpacity={0.8}
        strokeLinecap="round"
        fill="none"
        stroke="url(#hr)"
      />
      <line
        x1={scale(lerp1[activeStepIndex]?.x)}
        y1={scale(lerp1[activeStepIndex]?.y)}
        x2={scale(lerp2[activeStepIndex]?.x)}
        y2={scale(lerp2[activeStepIndex]?.y)}
        fill="hsl(223,15%,50%)"
        stroke="hsl(223,15%,50%)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{
          opacity: 0.2,
        }}
      />
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="hsl(var(--palette-red-50))"
        stroke="hsl(var(--palette-red-50))"
        strokeWidth={3}
        transform={`translate(${scale(lerp1[activeStepIndex]?.x)}, ${scale(
          lerp1[activeStepIndex]?.y
        )})`}
      />
      <circle
        cx={0}
        cy={0}
        r={4}
        fill="hsl(var(--palette-red-50))"
        stroke="hsl(var(--palette-red-50))"
        strokeWidth={3}
        transform={`translate(${scale(lerp2[activeStepIndex]?.x)}, ${scale(
          lerp2[activeStepIndex]?.y
        )})`}
      />
      <circle
        cx={0}
        cy={0}
        r={5}
        fill="var(--maximeheckel-colors-brand)"
        stroke="var(--maximeheckel-colors-brand)"
        strokeWidth={3}
        transform={`translate(${scale(data[activeStepIndex]?.x)}, ${scale(
          data[activeStepIndex]?.y
        )})`}
      />
    </Group>
  );
};

const Linear = (props: CurveProps) => {
  const { scale, activeStepIndex } = props;

  const getX = (d: Point) => d.x;
  const getY = (d: Point) => d.y;

  const x0 = 0;
  const y0 = 0;

  const x1 = 1;
  const y1 = 1;

  const data = React.useMemo(
    () => lerp({ x: x0, y: y0 }, { x: x1, y: y1 }),
    []
  );

  return (
    <Group>
      <LinePath
        data={data}
        x={(d) => scale(getX(d))}
        y={(d) => scale(getY(d))}
        stroke="url(#hr)"
        strokeWidth={6}
        strokeOpacity={0.8}
        strokeLinecap="round"
        fill="none"
      />
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
    </Group>
  );
};

const Chart = (props: ChartProps) => {
  const { width, type } = props;
  const [paused, setPaused] = React.useState(true);
  const [activeStepIndex, setActiveStepIndex] = React.useState(0);

  const dimension = width / 2;

  const repeat = () => setActiveStepIndex(0);

  const scale = scaleLinear({
    domain: [0, 1],
    range: [0, dimension],
    nice: true,
  });

  useInterval(() => {
    if (paused) {
      return;
    }

    if (activeStepIndex < 60) {
      setActiveStepIndex((prev) => prev + 1);
    }
  }, 1000 / 60);

  return (
    <Flex direction="column" alignItems="center" css={{ gap: '28px' }}>
      <svg width={dimension} height={dimension} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
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
        </defs>
        {type === 'linear' ? (
          <Linear scale={scale} activeStepIndex={activeStepIndex} />
        ) : null}
        {type === 'quadratic' ? (
          <Quadratic scale={scale} activeStepIndex={activeStepIndex} />
        ) : null}
        {type === 'cubic' ? (
          <Cubic scale={scale} activeStepIndex={activeStepIndex} />
        ) : null}
      </svg>
      <Flex direction="column" alignItems="start" css={{ width: '50%' }}>
        <div>
          t:{' '}
          <HighlightedValue>
            {(activeStepIndex / 60).toFixed(2)}
          </HighlightedValue>
        </div>
        <Range
          id="timeline"
          aria-label="Timeline"
          min={0}
          max={60}
          step={1}
          value={activeStepIndex}
          onChange={(value) => {
            setPaused(true);
            setActiveStepIndex(value);
          }}
        />
      </Flex>
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
    </Flex>
  );
};

const BezierCurves = (props: BezierCurvesProps) => {
  const { type } = props;

  const titlePerType = {
    linear: 'Linear Bézier Curve / Linear interpolation',
    quadratic: 'Quadratic Bézier Curve',
    cubic: 'Cubic Bézier Curve',
  };

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
      title={titlePerType[type]}
    >
      <Card.Body>
        <ParentSize>
          {({ width }) => <Chart width={width} type={type} />}
        </ParentSize>
      </Card.Body>
    </Card>
  );
};

export default BezierCurves;
