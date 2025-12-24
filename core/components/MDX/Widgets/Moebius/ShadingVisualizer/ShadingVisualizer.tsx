import { Box, Card, Flex, Grid } from '@maximeheckel/design-system';
import React, { useDeferredValue, useMemo, useState } from 'react';

import { HighlightedCodeText } from '@core/components/Code/CodeBlock';
import Select from '@core/components/Select/Select';
import { Slider } from '@core/components/Slider';

interface CellProps {
  value: number;
  luma: number;
}

const Cell = (props: CellProps) => {
  const { value, luma } = props;

  let color = `oklch(${luma}% 0.172 var(--base-hue))`;

  if (value >= 0.5) {
    color = 'oklch(18.68% 0.01 var(--base-hue))';
  }

  return (
    <>
      <Flex
        alignItems="center"
        css={{
          all: 'unset',
          aspectRatio: '1 / 1',
          borderBottom: '0.5px solid var(--gray-700)',
          borderLeft: '0.5px solid var(--gray-700)',
          textAlign: 'center',
          position: 'relative',

          '&:disabled': {
            cursor: 'not-allowed',
          },
        }}
        justifyContent="center"
        style={{
          backgroundColor: color,
        }}
      />
    </>
  );
};

const SIZE = 33;
const RASTER_SIZE = 10.0;

const raster = (_x: number, _y: number, luma: number) => {
  const raster = Math.sqrt(
    Math.pow((_x % RASTER_SIZE) / RASTER_SIZE - 0.5, 2) +
      Math.pow((_y % RASTER_SIZE) / RASTER_SIZE - 0.5, 2)
  );

  return luma >= raster * 95 ? 0.0 : 1.0;
};

const shader3 = (_x: number, _y: number) => {
  return (_x + _y) % 8 === 0.0 ? 1 : 0;
};

const shader2 = (_x: number, _y: number) => {
  return _x % 8 === 0.0 ? 1 : 0;
};

const shader1 = (_x: number, _y: number) => {
  return _y % 8 === 0.0 ? 1 : 0;
};

const crossHatched = (_x: number, _y: number, luma: number) => {
  switch (true) {
    case luma <= 45: {
      return shader1(_x, _y) + shader2(_x, _y) + shader3(_x, _y);
    }
    case luma <= 55: {
      return shader3(_x, _y) + shader2(_x, _y);
    }
    case luma <= 65: {
      return shader3(_x, _y);
    }
    default: {
      return 0.0;
    }
  }
};

type ShadowType = 'crossHatched' | 'raster';

const rasterGLSLCodeString = `const float rasterSize = 6.0;
float raster = length(
  mod(vUv * uResolution.xy, 
    vec2(rasterSize)) 
  / rasterSize - vec2(0.5));

if (pixelLuma <= raster) {
  pixelColor = outlineColor;
}`;

const crossHatchedGLSLCodeString = `if ((pixelLuma <= 0.45 
  && mod(vUv.y * uResolution.y, 8.0) <= 1.0) ||
  (pixelLuma <= 0.55 
  && mod(vUv.x * uResolution.x, 8.0) <= 1.0) ||
  (pixelLuma <= 0.65 
  && mod(vUv.x * uResolution.y + 
  vUv.y * uResolution.x, 8.0) <= 1.0)) {
    pixelColor = outlineColor;
}`;

const shadowOptions = [
  { label: 'Crosshatched Shadow', value: 'crossHatched' },
  { label: 'Raster Shadow', value: 'raster' },
];

const ShadingVisualizer = () => {
  const [luma, setLuma] = useState(65);
  const [shadowType, setShadowType] = useState<ShadowType>('crossHatched');

  // Defer expensive matrix computation so the slider stays responsive
  const deferredLuma = useDeferredValue(luma);

  const codeString =
    shadowType === 'raster' ? rasterGLSLCodeString : crossHatchedGLSLCodeString;

  const emptyMatrix = useMemo(
    () =>
      Array(SIZE)
        .fill(null)
        .map(() => Array(SIZE).fill(null)),
    []
  );

  const matrix = useMemo(
    () =>
      emptyMatrix
        .map((row, y) =>
          row.map((_, x) => {
            switch (shadowType) {
              case 'raster': {
                return raster(x, y, deferredLuma);
              }
              default: {
                return crossHatched(x, y, deferredLuma);
              }
            }
          })
        )
        .reverse(),
    [emptyMatrix, deferredLuma, shadowType]
  );

  return (
    <Card css={{ width: '100%' }}>
      <Card.Body
        as={Flex}
        direction="column"
        dotMatrix
        justifyContent="center"
        alignItems="start"
        gap="6"
      >
        <Flex alignItems="center" css={{ width: '100%' }} gap="4">
          <Box>
            <Select
              id="shading-function"
              aria-label="Shadow type"
              items={shadowOptions}
              value={shadowType}
              minWidth={190}
              onChange={(value) => setShadowType(value as ShadowType)}
            />
          </Box>
          <Box css={{ flex: 1 }}>
            <Slider
              id="timeline"
              label="Luma"
              min={40}
              max={70}
              step={1}
              value={luma}
              size="sm"
              onChange={(value) => {
                setLuma(value);
              }}
            />
          </Box>
        </Flex>

        <Grid
          css={{
            borderTop: '0.5px solid var(--gray-700)',
            borderRight: '0.5px solid var(--gray-700)',

            width: '100%',
          }}
          templateColumns={`repeat(${SIZE}, 1fr)`}
        >
          {matrix.map((row, idy) => (
            <React.Fragment key={idy}>
              {row.map((value, idx) => (
                <Cell
                  key={`${value}-${idx}-${idy}`}
                  luma={deferredLuma}
                  value={value}
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </Card.Body>
      <Box
        css={{
          '& pre': {
            whiteSpace: 'pre-wrap',
          },
        }}
      >
        <HighlightedCodeText codeString={codeString} language="glsl" />
      </Box>
    </Card>
  );
};

export default ShadingVisualizer;
