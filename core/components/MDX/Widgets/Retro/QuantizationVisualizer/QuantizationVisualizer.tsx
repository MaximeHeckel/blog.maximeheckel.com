import { Card, Flex, Grid, Range, Switch } from '@maximeheckel/design-system';
import React, { useMemo, useState } from 'react';
import { HighlightedValue } from '../../Components';

const WIDTH = 63;
const HEIGHT = 31;

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

const normalizedBayerMatrix8 = bayerMatrix8.map((row) =>
  row.map((value) => value / 64)
);

// half and half
const shader1 = (_x: number, _y: number) => Math.cos((_y - _x) * 3.0);

interface CellProps {
  ditheringEnabled: boolean;
  value: number;
  x: number;
  y: number;
  numberOfColor: number;
}

const getBayerMatrixValue = (x: number, y: number) => {
  const matrixSize = normalizedBayerMatrix8.length;
  const value = normalizedBayerMatrix8[y % matrixSize][x % matrixSize];
  return value;
};

const Cell = (props: CellProps) => {
  const { x, y, value, numberOfColor, ditheringEnabled } = props;

  let r = value;
  let g = value;
  let b = value;

  if (ditheringEnabled) {
    const bayerValue = getBayerMatrixValue(x, y);

    r += bayerValue * 0.4;
    g += bayerValue * 0.4;
    b += bayerValue * 0.4;

    const COLOR_NUM = numberOfColor;

    r = Math.floor(r * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
    g = Math.floor(g * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
    b = Math.floor(b * (COLOR_NUM - 1.0) + 0.5) / (COLOR_NUM - 1.0);
  }

  const color = `rgb(${r * 48}, ${g * 184}, ${b * 255})`;

  return (
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
  );
};

const DitheringVisualizer = () => {
  const [numberOfColor, setNumberOfColor] = useState<number>(2);
  const [ditheringEnabled, setDitheringEnabled] = useState<boolean>(false);

  const emptyMatrix = useMemo(
    () =>
      Array(HEIGHT)
        .fill(null)
        .map(() => Array(WIDTH).fill(null)),
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
          alignItems="center"
          justifyContent="space-between"
          css={{ width: '100%' }}
        >
          <Flex alignItems="start" direction="column" gap="4">
            <Switch
              id="dither"
              aria-label="Dither"
              label="Enable Dithering"
              onChange={toggleDithering}
              checked={ditheringEnabled}
            />
          </Flex>
        </Flex>
        <Grid
          css={{
            borderTop: '0.5px solid var(--gray-700)',
            borderRight: '0.5px solid var(--gray-700)',

            width: '100%',
          }}
          templateColumns={`repeat(${WIDTH}, 1fr)`}
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
                  numberOfColor={Math.pow(2, numberOfColor)}
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>

        <Range
          id="number-of-color"
          aria-label="Number of Color"
          disabled={!ditheringEnabled}
          label={
            <span>
              Number of colors:{' '}
              <HighlightedValue>{Math.pow(2, numberOfColor)}</HighlightedValue>
            </span>
          }
          min={1}
          max={5}
          step={1}
          value={numberOfColor}
          onChange={(value) => {
            setNumberOfColor(value);
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default DitheringVisualizer;
