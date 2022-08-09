import { scaleTime, scaleLinear } from '@visx/scale';
import { curveBasisOpen } from '@visx/curve';
import { LinePath, AreaClosed, Bar, Line } from '@visx/shape';
import { defaultStyles, TooltipWithBounds, withTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { ClipPath } from '@visx/clip-path';
import { Group } from '@visx/group';
import { bisector, extent } from 'd3-array';
import { format } from 'date-fns';
import { motion, useMotionValue } from 'framer-motion';
import React from 'react';

type Data = {
  x: string | number;
  y: number;
};

type FormattedData = {
  x: Date;
  y: number;
};

interface LineChartProps {
  data: Data[];
  height: number;
  width: number;
  unit?: string;
  noTooltip?: boolean;
}

const tooltipStyles = {
  ...defaultStyles,
  background: 'white',
  color: 'black',
};

const getX = (d: FormattedData) => d.x;
const getY = (d: FormattedData) => d.y;

const bisectDate = bisector((d: FormattedData) => {
  return d.x;
}).right;

const LineChart = withTooltip<LineChartProps, FormattedData>(
  ({
    data,
    height,
    width,
    unit,
    noTooltip,
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  }) => {
    const [shouldAnimate, setShouldAnimate] = React.useState<boolean>(false);

    const pathVariants = {
      initial: {
        pathLength: 0,
      },
      animate: {
        pathLength: 1,
        transition: {
          ease: 'easeInOut',
          duration: 2,
        },
      },
    };

    const areaVariants = {
      initial: {
        width: '0%',
      },
      animate: {
        width: '100%',
        transition: {
          delay: 0.5,
          ease: 'easeInOut',
          duration: 2,
        },
      },
    };

    const pathLength = useMotionValue(0);

    React.useEffect(() => {
      setTimeout(() => setShouldAnimate(true), 500);
    }, []);

    const formattedData = data
      .map((d) => {
        return {
          x: new Date(d.x),
          y: d.y,
        };
      })
      // Need to sort elements to make bisection work
      .sort((a, b) => {
        // @ts-ignore
        return a.x - b.x;
      });

    const xScale = React.useMemo(
      () =>
        scaleTime({
          range: [-4, width + 2],
          domain: extent(formattedData, (d) => d.x) as [Date, Date],
        }),
      [formattedData, width]
    );

    const valueScale = React.useMemo(
      () =>
        scaleLinear({
          range: [height, 0],
          domain: [
            // eslint-disable-next-line prefer-spread
            Math.min.apply(
              Math,
              formattedData.map((d) => d.y)
            ),
            // eslint-disable-next-line prefer-spread
            Math.max.apply(
              Math,
              formattedData.map((d) => d.y)
            ),
          ],
          nice: true,
        }),
      [formattedData, height]
    );

    const handleTooltip = React.useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>
      ) => {
        const { x } = localPoint(event) || { x: 0 };

        const x0 = xScale.invert(x);

        const index = bisectDate(formattedData, x0, 1);

        const d = formattedData[index - 1];

        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: valueScale(getY(d)),
        });
      },
      [xScale, formattedData, showTooltip, valueScale]
    );

    return (
      <div>
        <svg width={width} height={height}>
          <defs>
            <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="20%"
                stopColor="hsl(var(--palette-pink-50))"
                stopOpacity={0.8}
              />
              <stop
                offset="99%"
                stopColor="hsl(var(--palette-pink-50))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <ClipPath id="myClip">
            <motion.rect
              x={0}
              y={0}
              height={height}
              initial="initial"
              animate="animate"
              variants={areaVariants}
            />
          </ClipPath>
          <Group clipPath={'url(#myClip)'}>
            <AreaClosed
              data={formattedData}
              x={(d) => xScale(getX(d)) ?? 0}
              y={(d) => valueScale(getY(d)) ?? 0}
              yScale={valueScale}
              curve={curveBasisOpen}
              fill="url(#hr)"
              strokeWidth={0}
            />
            <LinePath
              data={formattedData}
              x={(d) => xScale(getX(d)) ?? 0}
              y={(d) => valueScale(getY(d)) ?? 0}
              curve={curveBasisOpen}
            >
              {({ path }) => {
                const d = path(formattedData) || '';

                return (
                  <>
                    {shouldAnimate && (
                      <motion.path
                        d={d}
                        strokeWidth={2}
                        strokeOpacity={0.8}
                        strokeLinecap="round"
                        fill="none"
                        stroke="hsl(var(--palette-pink-50))"
                        initial="initial"
                        animate="animate"
                        variants={pathVariants}
                        style={{
                          strokeDashoffset: pathLength,
                          strokeDasharray: pathLength,
                        }}
                      />
                    )}
                  </>
                );
              }}
            </LinePath>
          </Group>
          <Bar
            width={width}
            height={height}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {tooltipData && !noTooltip && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: 0 }}
                to={{ x: tooltipLeft, y: height }}
                stroke="var(--maximeheckel-colors-typeface-primary)"
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="1,3"
                strokeOpacity={0.2}
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop || 0 + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill="black"
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && !noTooltip && (
          <div>
            {/* @ts-ignore */}
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop}
              left={tooltipLeft}
              style={tooltipStyles}
            >
              <div>{`${getY(tooltipData)} ${unit}`}</div>
              <div>{format(getX(tooltipData), 'yyyy-MM-dd HH:mm')}</div>
            </TooltipWithBounds>
          </div>
        )}
      </div>
    );
  }
);

export default LineChart;
