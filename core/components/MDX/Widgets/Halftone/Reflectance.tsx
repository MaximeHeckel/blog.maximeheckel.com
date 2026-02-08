import { Box, Flex, GlassMaterial, Text } from '@maximeheckel/design-system';
import { ResponsiveLine } from '@nivo/line';
import React, { useMemo, useState } from 'react';

interface ColorToggleProps {
  label: string;
  color: string;
  active: boolean;
  onToggle: () => void;
}

const ColorToggle: React.FC<ColorToggleProps> = ({
  label,
  color,
  active,
  onToggle,
}) => {
  return (
    <Flex
      as="button"
      type="button"
      alignItems="center"
      gap="2"
      onClick={onToggle}
      css={{
        cursor: 'pointer',
        padding: 'var(--space-1)',
        opacity: active ? 1 : 0.4,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--border-radius-2)',
        transition: 'opacity 0.2s ease',
        '&:hover': {
          opacity: active ? 1 : 0.75,
        },
        '&:focus-visible': {
          outline: '2px solid var(--accent)',
          opacity: 1,
          outlineOffset: '2px',
        },
      }}
    >
      <Box
        css={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: color,
          filter: active ? 'none' : 'grayscale(100%)',
          transition: 'filter 0.2s ease',
        }}
      />
      <Text
        css={{
          userSelect: 'none',
          letterSpacing: '-0.01em',
        }}
        family="display"
        size="1"
        weight="3"
        variant="primary"
      >
        {label}
      </Text>
    </Flex>
  );
};

const CYAN_DATA: [number, number][] = [
  [400, 0.18],
  [420, 0.45],
  [440, 0.65],
  [460, 0.7],
  [480, 0.7],
  [500, 0.65],
  [520, 0.55],
  [540, 0.32],
  [560, 0.12],
  [580, 0.04],
  [600, 0.04],
  [620, 0.04],
  [640, 0.04],
  [660, 0.04],
  [680, 0.04],
  [700, 0.04],
];

const MAGENTA_DATA: [number, number][] = [
  [400, 0.35],
  [420, 0.4],
  [440, 0.35],
  [460, 0.25],
  [480, 0.15],
  [500, 0.08],
  [520, 0.06],
  [540, 0.08],
  [560, 0.15],
  [580, 0.35],
  [600, 0.6],
  [620, 0.75],
  [640, 0.85],
  [660, 0.85],
  [680, 0.85],
  [700, 0.85],
];

const YELLOW_DATA: [number, number][] = [
  [400, 0.03],
  [420, 0.03],
  [440, 0.03],
  [460, 0.03],
  [480, 0.04],
  [500, 0.22],
  [520, 0.58],
  [540, 0.82],
  [560, 0.9],
  [580, 0.92],
  [600, 0.92],
  [620, 0.92],
  [640, 0.92],
  [660, 0.92],
  [680, 0.92],
  [700, 0.92],
];

const RED_DATA: [number, number][] = [
  [400, 0.02],
  [420, 0.02],
  [440, 0.02],
  [460, 0.02],
  [480, 0.02],
  [500, 0.03],
  [520, 0.05],
  [540, 0.1],
  [560, 0.25],
  [580, 0.55],
  [600, 0.8],
  [620, 0.9],
  [640, 0.95],
  [660, 0.97],
  [680, 0.97],
  [700, 0.97],
];

const GREEN_DATA: [number, number][] = [
  [400, 0.02],
  [420, 0.03],
  [440, 0.05],
  [460, 0.1],
  [480, 0.25],
  [500, 0.55],
  [520, 0.87],
  [540, 0.95],
  [560, 0.87],
  [580, 0.55],
  [600, 0.25],
  [620, 0.1],
  [640, 0.05],
  [660, 0.03],
  [680, 0.02],
  [700, 0.02],
];

const BLUE_DATA: [number, number][] = [
  [400, 0.97],
  [420, 0.97],
  [440, 0.97],
  [460, 0.95],
  [480, 0.85],
  [500, 0.5],
  [520, 0.2],
  [540, 0.08],
  [560, 0.03],
  [580, 0.02],
  [600, 0.02],
  [620, 0.02],
  [640, 0.02],
  [660, 0.02],
  [680, 0.02],
  [700, 0.02],
];

const catmullRom = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};

const interpolateReflectance = (
  data: [number, number][],
  wavelength: number
): number => {
  let segmentIndex = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (wavelength >= data[i][0] && wavelength <= data[i + 1][0]) {
      segmentIndex = i;
      break;
    }
  }

  if (wavelength <= data[0][0]) return data[0][1];
  if (wavelength >= data[data.length - 1][0]) return data[data.length - 1][1];

  const i0 = Math.max(0, segmentIndex - 1);
  const i1 = segmentIndex;
  const i2 = Math.min(data.length - 1, segmentIndex + 1);
  const i3 = Math.min(data.length - 1, segmentIndex + 2);

  const [w1] = data[i1];
  const [w2] = data[i2];

  const t = (wavelength - w1) / (w2 - w1);

  return Math.max(
    0,
    Math.min(
      1,
      catmullRom(data[i0][1], data[i1][1], data[i2][1], data[i3][1], t)
    )
  );
};

const generateReflectanceCurve = (
  type: 'cyan' | 'magenta' | 'yellow' | 'red' | 'green' | 'blue'
): { x: number; y: number }[] => {
  const dataMap = {
    cyan: CYAN_DATA,
    magenta: MAGENTA_DATA,
    yellow: YELLOW_DATA,
    red: RED_DATA,
    green: GREEN_DATA,
    blue: BLUE_DATA,
  };
  const data = dataMap[type];

  const points: { x: number; y: number }[] = [];

  for (let wavelength = 400; wavelength <= 700; wavelength += 5) {
    const reflectance = interpolateReflectance(data, wavelength);
    points.push({ x: wavelength, y: reflectance });
  }

  return points;
};

const getCIEXYZ = (wavelength: number): { x: number; y: number; z: number } => {
  const x =
    1.056 * Math.exp(-0.5 * Math.pow((wavelength - 599.8) / 37.9, 2)) +
    0.362 * Math.exp(-0.5 * Math.pow((wavelength - 442.0) / 16.0, 2)) -
    0.065 * Math.exp(-0.5 * Math.pow((wavelength - 501.1) / 20.4, 2));

  const y =
    0.821 * Math.exp(-0.5 * Math.pow((wavelength - 568.8) / 46.9, 2)) +
    0.286 * Math.exp(-0.5 * Math.pow((wavelength - 530.9) / 31.1, 2));

  const z =
    1.217 * Math.exp(-0.5 * Math.pow((wavelength - 437.0) / 11.8, 2)) +
    0.681 * Math.exp(-0.5 * Math.pow((wavelength - 459.0) / 26.0, 2));

  return { x: Math.max(0, x), y: Math.max(0, y), z: Math.max(0, z) };
};

const xyzToRGB = (
  X: number,
  Y: number,
  Z: number
): { r: number; g: number; b: number } => {
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  let g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  let b = 0.0557 * X - 0.204 * Y + 1.057 * Z;

  const gammaCorrect = (c: number) => {
    if (c <= 0.0031308) {
      return 12.92 * c;
    }
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  r = gammaCorrect(r);
  g = gammaCorrect(g);
  b = gammaCorrect(b);

  return { r, g, b };
};

const calculateColorFromReflectance = (
  curve: { x: number; y: number }[]
): string => {
  const power = 8;

  let X = 0,
    Y = 0,
    Z = 0;

  curve.forEach((point) => {
    const cie = getCIEXYZ(point.x);
    const reflectance = Math.pow(point.y, power);
    X += cie.x * reflectance;
    Y += cie.y * reflectance;
    Z += cie.z * reflectance;
  });

  const { r, g, b } = xyzToRGB(X, Y, Z);

  const maxVal = Math.max(r, g, b, 0.001);

  const rNorm = Math.max(0, r / maxVal);
  const gNorm = Math.max(0, g / maxVal);
  const bNorm = Math.max(0, b / maxVal);

  const clamp = (v: number) => Math.round(Math.max(0, Math.min(255, v * 255)));

  return `rgb(${clamp(rNorm)}, ${clamp(gNorm)}, ${clamp(bNorm)})`;
};

const PIGMENT_COLORS = {
  cyan: 'hsl(185, 100%, 45%)',
  magenta: 'hsl(310, 100%, 50%)',
  yellow: 'hsl(50, 100%, 50%)',
  red: 'hsl(0, 100%, 50%)',
  green: 'hsl(120, 100%, 40%)',
  blue: 'hsl(220, 100%, 55%)',
};

interface ReflectanceProps {
  height?: number;
  mode?: 'CMYK' | 'RGB';
}

export const Reflectance: React.FC<ReflectanceProps> = ({
  height = 300,
  mode = 'CMYK',
}) => {
  const [showCyan, setShowCyan] = useState(true);
  const [showMagenta, setShowMagenta] = useState(false);
  const [showYellow, setShowYellow] = useState(true);

  const [showRed, setShowRed] = useState(false);
  const [showGreen, setShowGreen] = useState(true);
  const [showBlue, setShowBlue] = useState(true);

  const cyanCurve = useMemo(() => generateReflectanceCurve('cyan'), []);
  const magentaCurve = useMemo(() => generateReflectanceCurve('magenta'), []);
  const yellowCurve = useMemo(() => generateReflectanceCurve('yellow'), []);

  const redCurve = useMemo(() => generateReflectanceCurve('red'), []);
  const greenCurve = useMemo(() => generateReflectanceCurve('green'), []);
  const blueCurve = useMemo(() => generateReflectanceCurve('blue'), []);

  const mixedCurve = useMemo(() => {
    if (mode === 'CMYK') {
      return cyanCurve.map((point, i) => {
        let result = 1;
        if (showCyan) result *= cyanCurve[i].y;
        if (showMagenta) result *= magentaCurve[i].y;
        if (showYellow) result *= yellowCurve[i].y;
        return { x: point.x, y: result };
      });
    } else {
      return redCurve.map((point, i) => {
        let result = 0;
        if (showRed) result += redCurve[i].y;
        if (showGreen) result += greenCurve[i].y;
        if (showBlue) result += blueCurve[i].y;
        return { x: point.x, y: Math.min(1, result) };
      });
    }
  }, [
    mode,
    cyanCurve,
    magentaCurve,
    yellowCurve,
    redCurve,
    greenCurve,
    blueCurve,
    showCyan,
    showMagenta,
    showYellow,
    showRed,
    showGreen,
    showBlue,
  ]);

  const resultingColor = useMemo(() => {
    if (mode === 'CMYK') {
      const activeColors = [
        showCyan && 'cyan',
        showMagenta && 'magenta',
        showYellow && 'yellow',
      ].filter(Boolean) as ('cyan' | 'magenta' | 'yellow')[];

      if (activeColors.length === 0) return 'rgb(255, 255, 255)';
      if (activeColors.length === 1) return PIGMENT_COLORS[activeColors[0]];
      return calculateColorFromReflectance(mixedCurve);
    } else {
      const r = showRed ? 255 : 0;
      const g = showGreen ? 255 : 0;
      const b = showBlue ? 255 : 0;
      if (r === 0 && g === 0 && b === 0) return 'rgb(0, 0, 0)';
      return `rgb(${r}, ${g}, ${b})`;
    }
  }, [
    mode,
    mixedCurve,
    showCyan,
    showMagenta,
    showYellow,
    showRed,
    showGreen,
    showBlue,
  ]);

  const chartData = useMemo(() => {
    const data: {
      id: string;
      color: string;
      data: { x: number; y: number }[];
    }[] = [];

    const colorConfig =
      mode === 'CMYK'
        ? [
            { id: 'Cyan', show: showCyan, curve: cyanCurve },
            { id: 'Magenta', show: showMagenta, curve: magentaCurve },
            { id: 'Yellow', show: showYellow, curve: yellowCurve },
          ]
        : [
            { id: 'Red', show: showRed, curve: redCurve },
            { id: 'Green', show: showGreen, curve: greenCurve },
            { id: 'Blue', show: showBlue, curve: blueCurve },
          ];

    colorConfig.forEach(({ id, show, curve }) => {
      if (show) {
        data.push({
          id,
          color:
            PIGMENT_COLORS[id.toLowerCase() as keyof typeof PIGMENT_COLORS],
          data: curve,
        });
      }
    });

    const activeCount = colorConfig.filter(({ show }) => show).length;
    if (activeCount >= 2) {
      data.push({
        id: 'Result',
        color: resultingColor,
        data: mixedCurve,
      });
    }

    return data;
  }, [
    mode,
    showCyan,
    showMagenta,
    showYellow,
    showRed,
    showGreen,
    showBlue,
    cyanCurve,
    magentaCurve,
    yellowCurve,
    redCurve,
    greenCurve,
    blueCurve,
    mixedCurve,
    resultingColor,
  ]);

  return (
    <Flex
      as={Flex}
      css={{
        padding: 'var(--space-1) var(--space-0) var(--space-3) var(--space-1)',
      }}
      direction="column"
      gap="4"
    >
      <Flex alignItems="center" justifyContent="center" wrap="wrap" gap="4">
        <Box
          css={{
            position: 'relative',
            zIndex: 1,
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--border-radius-3)',
            backgroundColor:
              'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
            border:
              '1px solid oklch(from var(--gray-1100) l c h / var(--border-opacity, 0.1))',
          }}
        >
          <Flex gap="4" wrap="wrap">
            {mode === 'CMYK' ? (
              <>
                <ColorToggle
                  label="Cyan"
                  color={PIGMENT_COLORS.cyan}
                  active={showCyan}
                  onToggle={() => setShowCyan((prev) => !prev)}
                />
                <ColorToggle
                  label="Magenta"
                  color={PIGMENT_COLORS.magenta}
                  active={showMagenta}
                  onToggle={() => setShowMagenta((prev) => !prev)}
                />
                <ColorToggle
                  label="Yellow"
                  color={PIGMENT_COLORS.yellow}
                  active={showYellow}
                  onToggle={() => setShowYellow((prev) => !prev)}
                />
              </>
            ) : (
              <>
                <ColorToggle
                  label="Red"
                  color={PIGMENT_COLORS.red}
                  active={showRed}
                  onToggle={() => setShowRed((prev) => !prev)}
                />
                <ColorToggle
                  label="Green"
                  color={PIGMENT_COLORS.green}
                  active={showGreen}
                  onToggle={() => setShowGreen((prev) => !prev)}
                />
                <ColorToggle
                  label="Blue"
                  color={PIGMENT_COLORS.blue}
                  active={showBlue}
                  onToggle={() => setShowBlue((prev) => !prev)}
                />
              </>
            )}
          </Flex>
        </Box>
      </Flex>
      <Box css={{ height: `${height}px`, width: '100%' }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          xScale={{ type: 'linear', min: 400, max: 700 }}
          yScale={{ type: 'linear', min: 0, max: 1 }}
          curve="basis"
          colors={(d) => d.color}
          lineWidth={3}
          pointSize={0}
          enableGridX={true}
          enableGridY={true}
          gridYValues={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          layers={[
            ({ innerWidth, innerHeight }) => (
              <g key="spectrum-background">
                <defs>
                  <linearGradient
                    id="spectrumGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#8000ff" />
                    <stop offset="16%" stopColor="#0000ff" />
                    <stop offset="33%" stopColor="#00ffff" />
                    <stop offset="50%" stopColor="#00ff00" />
                    <stop offset="66%" stopColor="#ffff00" />
                    <stop offset="83%" stopColor="#ff8000" />
                    <stop offset="100%" stopColor="#ff0000" />
                  </linearGradient>
                </defs>
                <rect
                  x={0}
                  y={innerHeight - 45}
                  width={innerWidth}
                  height={45}
                  fill="url(#spectrumGradient)"
                  opacity={0.15}
                />
              </g>
            ),
            'grid',
            'axes',
            ({ innerWidth, innerHeight }) => (
              <rect
                key="chart-border"
                x={0}
                y={0}
                width={innerWidth}
                height={innerHeight}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth={1}
              />
            ),
            ({ series, lineGenerator, xScale, yScale }) => (
              <g key="lines-with-fade">
                {series.map((s) => (
                  <path
                    key={s.id}
                    d={
                      lineGenerator(
                        s.data.map((d) => ({
                          x: xScale(d.data.x),
                          y: yScale(d.data.y),
                        }))
                      ) || ''
                    }
                    fill="none"
                    stroke={s.color}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            ),
            'slices',
            'crosshair',
            'legends',
          ]}
          axisBottom={{
            tickValues: [400, 450, 500, 550, 600, 650, 700],
            legend: 'Wavelength (nm)',
            legendOffset: 40,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickValues: [0, 0.2, 0.4, 0.6, 0.8, 1],
            legend: 'Reflectance (%)',
            legendOffset: -45,
            legendPosition: 'middle',
            format: (v) => `${Math.round(Number(v) * 100)}`,
          }}
          enableSlices="x"
          sliceTooltip={({ slice }) => {
            const xValue = Number(slice.points[0].data.x);
            const isLeftHalf = xValue < 500;

            return (
              <Box
                css={{
                  width: '150px',
                  position: 'relative',
                  borderRadius: 'var(--border-radius-2)',
                  transition: 'transform 0.25s ease-in-out',
                  transform: isLeftHalf
                    ? 'translateX(calc(100% + 32px))'
                    : 'translateX(-4px)',
                }}
              >
                <GlassMaterial />
                <Text
                  size="1"
                  variant="primary"
                  weight="4"
                  css={{
                    display: 'block',
                    borderBottom: '1px solid var(--gray-600)',
                    padding: 'var(--space-1) var(--space-2)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {slice.points[0].data.x}nm
                </Text>
                <Flex
                  css={{ padding: 'var(--space-1) var(--space-2)' }}
                  direction="column"
                  gap="1"
                  alignItems="start"
                >
                  {slice.points.map((point) => (
                    <Flex key={point.id} alignItems="center" gap="2">
                      <Box
                        css={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: '1px solid var(--gray-600)',
                          flexShrink: 0,
                          background: point.seriesColor,
                        }}
                      />
                      <Text size="1" variant="primary" weight="3">
                        {point.seriesId}:{' '}
                        <Text
                          css={{ fontVariantNumeric: 'tabular-nums' }}
                          size="1"
                          variant="primary"
                          weight="3"
                        >
                          {Math.round(Number(point.data.y) * 100)}%
                        </Text>
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            );
          }}
          theme={{
            background: 'transparent',
            text: {
              fill: 'var(--gray-900)',
              fontSize: 12,
            },
            grid: {
              line: {
                stroke: 'var(--border-color)',
                strokeWidth: 1,
                opacity: 1,
                strokeDasharray: '2 2',
              },
            },
            axis: {
              ticks: {
                line: {
                  stroke: 'var(--text-tertiary)',
                },
                text: {
                  fill: 'var(--text-tertiary)',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  userSelect: 'none',
                },
              },
              legend: {
                text: {
                  fill: 'var(--text-tertiary)',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                },
              },
            },
            crosshair: {
              line: {
                stroke: 'var(--gray-900)',
                strokeDasharray: '4 4',
                strokeWidth: 0.75,
              },
            },
          }}
          legends={[]}
        />
      </Box>
    </Flex>
  );
};
