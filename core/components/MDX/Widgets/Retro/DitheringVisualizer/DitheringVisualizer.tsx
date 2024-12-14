import {
  Card,
  Flex,
  Grid,
  Label,
  Radio,
  Switch,
  Tooltip,
} from '@maximeheckel/design-system';
import React, { useMemo, useState } from 'react';

const SIZE = 31;

const bayerMatrix2 = [
  [0, 2],
  [3, 1],
];

const bayerMatrix4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const bayerMatrix8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

const normalizedBayerMatrix2 = bayerMatrix2.map((row) =>
  row.map((value) => value / 4)
);

const normalizedBayerMatrix4 = bayerMatrix4.map((row) =>
  row.map((value) => value / 16)
);
const normalizedBayerMatrix8 = bayerMatrix8.map((row) =>
  row.map((value) => value / 64)
);

// half and half
const shader1 = (_x: number, _y: number) => 1.0 - _x;

type DitheringType = 'random' | 'ordered';

interface CellProps {
  ditheringEnabled: boolean;
  value: number;
  x: number;
  y: number;
  bayerMatrix: number;
  type: DitheringType;
}

const getBayerMatrixValue = (x: number, y: number, bayerMatrix: number) => {
  const matrix =
    bayerMatrix === 2
      ? normalizedBayerMatrix2
      : bayerMatrix === 4
        ? normalizedBayerMatrix4
        : normalizedBayerMatrix8;

  const matrixSize = matrix.length;
  const value = matrix[y % matrixSize][x % matrixSize];
  return value;
};

const getLuminance = (r: number, g: number, b: number) => {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  return 0.2126 * normalizedR + 0.7152 * normalizedG + 0.0722 * normalizedB;
};

const Cell = (props: CellProps) => {
  const { x, y, value, bayerMatrix, ditheringEnabled, type } = props;

  const r = value * 255;
  const g = value * 255;
  const b = value * 255;
  let color = `rgb(${value * 87}, ${value * 134}, ${value * 245})`;

  const luminance = getLuminance(r, g, b);

  const bayerValue = getBayerMatrixValue(x, y, bayerMatrix);

  let content = `Luminance ${luminance.toFixed(3)}`;

  if (ditheringEnabled && type === 'ordered') {
    content = `Luminance ${luminance.toFixed(
      3
    )} / Bayer Matrix value ${bayerValue.toFixed(3)}`;

    if (luminance > bayerValue) {
      color = 'rgb(87, 134, 245)';
    } else {
      color = 'rgb(0, 0, 0)';
    }
  }

  if (ditheringEnabled && type === 'random') {
    const randomValue = Math.random();

    content = `Luminance ${luminance.toFixed(
      3
    )} / Random value ${randomValue.toFixed(3)}`;

    if (luminance > randomValue) {
      color = 'rgb(87, 134, 245)';
    } else {
      color = 'rgb(0, 0, 0)';
    }
  }

  return (
    <Tooltip content={content}>
      <Flex
        alignItems="center"
        css={{
          all: 'unset',
          aspectRatio: '1 / 1',
          borderBottom: '0.5px solid var(--gray-700)',
          borderLeft: '0.5px solid var(--gray-700)',
          textAlign: 'center',
          overflow: 'hidden',
          position: 'relative',
          maxWidth: 20,
        }}
        justifyContent="center"
        style={{
          backgroundColor: color,
        }}
      ></Flex>
    </Tooltip>
  );
};

const DitheringVisualizer = (props: { type: DitheringType }) => {
  const { type } = props;

  const [bayerMatrix, setBayerMatrix] = useState<number>(4);
  const [ditheringEnabled, setDitheringEnabled] = useState<boolean>(false);

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
          row.map((_, x) =>
            shader1(x / (row.length - 1), y / (emptyMatrix.length - 1))
          )
        )
        .reverse(),
    [emptyMatrix]
  );

  const toggleDithering = () => {
    setDitheringEnabled((prev) => !prev);
  };

  return (
    <Card css={{ width: '100%' }}>
      <Card.Body
        as={Flex}
        direction="column"
        dotMatrix
        justifyContent="center"
        gap="6"
      >
        <Flex
          justifyContent="space-between"
          css={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            '@media (max-width: 750px)': {
              flexDirection: 'column',
              alignItems: 'start',
            },
          }}
          gap="4"
        >
          <Switch
            id={`dither-${type}`}
            aria-label="Dither"
            label="Enable Dithering"
            onChange={toggleDithering}
            checked={ditheringEnabled}
          />

          {type === 'ordered' ? (
            <Flex alignItems="start" direction="column">
              <Label htmlFor="direction">Bayer Matrix size</Label>
              <Radio.Group
                id={`bayer-matrix-${type}`}
                name="Bayer Matrix"
                direction="horizontal"
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setBayerMatrix(parseInt(value, 10));
                }}
              >
                <Radio.Item
                  id="2x2"
                  value={2}
                  aria-label="2x2 Bayer Matrix"
                  label="2x2"
                  checked={bayerMatrix === 2}
                />
                <Radio.Item
                  id="4x4"
                  value={4}
                  aria-label="4x4 Bayer Matrix"
                  label="4x4"
                  checked={bayerMatrix === 4}
                />
                <Radio.Item
                  id="8x8"
                  value={8}
                  aria-label="8x8 Bayer Matrix"
                  label="8x8"
                  checked={bayerMatrix === 8}
                />
              </Radio.Group>
            </Flex>
          ) : null}
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
                  ditheringEnabled={ditheringEnabled}
                  x={idx}
                  y={idy}
                  value={value}
                  bayerMatrix={bayerMatrix}
                  type={type}
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default DitheringVisualizer;
