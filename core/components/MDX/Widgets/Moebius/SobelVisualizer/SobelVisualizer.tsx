import {
  Box,
  Card,
  Flex,
  Grid,
  Label,
  Radio,
  Text,
} from '@maximeheckel/design-system';
import React, { useMemo, useState, useCallback } from 'react';
import { HighlightedValue } from '../../Components';

interface CellProps {
  value: number;

  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  kernelValue?: string;
  result?: string | null;
}

const Cell = (props: CellProps) => {
  const { value, onClick, kernelValue, disabled, selected, result } = props;

  let color = 'var(--gray-000)';

  if (value >= 0.25) {
    color = `rgb(${value * 87},${value * 134},${value * 245})`;
  }

  return (
    <>
      <Flex
        as="button"
        alignItems="center"
        css={{
          all: 'unset',
          aspectRatio: '1 / 1',
          cursor: 'pointer',
          borderBottom: '0.5px solid var(--gray-700)',
          borderLeft: '0.5px solid var(--gray-700)',
          textAlign: 'center',
          position: 'relative',

          '&:disabled': {
            cursor: 'not-allowed',
          },
        }}
        disabled={disabled}
        justifyContent="center"
        onClick={onClick}
        style={{
          backgroundColor: color,
        }}
      >
        {result ? (
          <Flex
            css={{
              pointerEvents: 'none',
              position: 'absolute',
              top: '-225%',
              left: '50%',
              transform: 'translateX(-50%) translateY(25%)',
              zIndex: 1,
            }}
            gap="2"
          >
            <Text variant="primary">Output:</Text>
            <HighlightedValue
              css={{
                color: 'var(--text-primary)',
                borderColor: 'var(--text-primary)',
                backgroundColor: 'var(--foreground)',
              }}
            >
              {result}
            </HighlightedValue>
          </Flex>
        ) : null}
        {kernelValue ? (
          <Flex
            alignItems="center"
            css={{
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              position: 'absolute',
              background: 'oklch(from var(--gray-600) l c h / 55%)',
              border: '2px solid',
              borderRadius: 'var(--border-radius-0)',
            }}
            justifyContent="center"
            style={{
              borderColor: selected ? 'var(--text-primary)' : 'transparent',
            }}
          >
            <Text
              style={{
                color: 'var(--text-primary)',
              }}
              size="1"
              weight="4"
            >
              {kernelValue}
            </Text>
          </Flex>
        ) : null}
      </Flex>
    </>
  );
};

const SIZE = 16;

// square
const shader5 = (_x: number, _y: number) =>
  _x <= 0.75 && _x >= 0.25 && _y <= 0.75 && _y >= 0.25 ? 1.0 : 0.0;

// diagonal stripes
const shader4 = (_x: number, _y: number) => {
  const x = _x * (SIZE - 1);
  const y = _y * (SIZE - 1);
  return (x + y) % 8.0 <= 1.0 ? 1.0 : 0.0;
};

// horizontal stripes
const shader3 = (_x: number, _y: number) => {
  const y = _y * (SIZE - 1);
  return y % 5 <= 1.0 ? 1 : 0;
};

// vertical stripes
const shader2 = (_x: number, _y: number) => {
  const x = _x * (SIZE - 1);
  return x % 5 <= 1.0 ? 1 : 0;
};

// half and half
const shader1 = (_x: number, _y: number) => (_x <= 0.5 ? 1.0 : 0.0);

const shaderFunction = {
  shader1,
  shader2,
  shader3,
  shader4,
  shader5,
};

const sobelMatrixX = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

const sobelMatrixY = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

const SobelVisualizer = () => {
  const [selectedCell, setSelectedCell] = useState<[number, number]>([8, 8]);
  const [matrixDir, setMatrixDir] = useState<'x' | 'y'>('x');
  const sobelMatrix = matrixDir === 'x' ? sobelMatrixX : sobelMatrixY;
  const [shader, setShader] = React.useState<keyof typeof shaderFunction>(
    'shader2'
  );

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
            shaderFunction[shader](
              x / (row.length - 1),
              y / (emptyMatrix.length - 1)
            )
          )
        )
        .reverse(),
    [emptyMatrix, shader]
  );

  const onCellClick = (x: number, y: number) => {
    setSelectedCell([x, y]);
  };

  const kernel = useMemo(
    () => [
      [selectedCell[0] - 1, selectedCell[1] - 1],
      [selectedCell[0], selectedCell[1] - 1],
      [selectedCell[0] + 1, selectedCell[1] - 1],
      [selectedCell[0] - 1, selectedCell[1]],
      [selectedCell[0], selectedCell[1]],
      [selectedCell[0] + 1, selectedCell[1]],
      [selectedCell[0] - 1, selectedCell[1] + 1],
      [selectedCell[0], selectedCell[1] + 1],
      [selectedCell[0] + 1, selectedCell[1] + 1],
    ],
    [selectedCell]
  );

  const getKernelValue = useCallback(
    (x: number, y: number) => {
      switch (true) {
        case x === kernel[0][0] && y === kernel[0][1]:
          return sobelMatrix[0][0].toString();
        case x === kernel[1][0] && y === kernel[1][1]:
          return sobelMatrix[0][1].toString();
        case x === kernel[2][0] && y === kernel[2][1]:
          return sobelMatrix[0][2].toString();
        case x === kernel[3][0] && y === kernel[3][1]:
          return sobelMatrix[1][0].toString();
        case x === kernel[4][0] && y === kernel[4][1]:
          return sobelMatrix[1][1].toString();
        case x === kernel[5][0] && y === kernel[5][1]:
          return sobelMatrix[1][2].toString();
        case x === kernel[6][0] && y === kernel[6][1]:
          return sobelMatrix[2][0].toString();
        case x === kernel[7][0] && y === kernel[7][1]:
          return sobelMatrix[2][1].toString();
        case x === kernel[8][0] && y === kernel[8][1]:
          return sobelMatrix[2][2].toString();
        default:
          return undefined;
      }
    },
    [kernel, sobelMatrix]
  );

  const sobelGradientValue = useMemo(
    () =>
      matrix[kernel[0][1]][kernel[0][0]] * sobelMatrix[0][0] +
      matrix[kernel[1][1]][kernel[1][0]] * sobelMatrix[0][1] +
      matrix[kernel[2][1]][kernel[2][0]] * sobelMatrix[0][2] +
      matrix[kernel[3][1]][kernel[3][0]] * sobelMatrix[1][0] +
      matrix[kernel[4][1]][kernel[4][0]] * sobelMatrix[1][1] +
      matrix[kernel[5][1]][kernel[5][0]] * sobelMatrix[1][2] +
      matrix[kernel[6][1]][kernel[6][0]] * sobelMatrix[2][0] +
      matrix[kernel[7][1]][kernel[7][0]] * sobelMatrix[2][1] +
      matrix[kernel[8][1]][kernel[8][0]] * sobelMatrix[2][2],
    [kernel, matrix, sobelMatrix]
  );

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
          alignItems="start"
          justifyContent="space-around"
          css={{ width: '100%', paddingBottom: 'var(--space-5)' }}
        >
          <Flex alignItems="start" direction="column">
            <Label htmlFor="direction">Sobel matrix direction:</Label>
            <Radio.Group
              id="direction"
              name="direction"
              direction="vertical"
              onChange={(event) => {
                const value = event.currentTarget.value as 'x' | 'y';
                setMatrixDir(value);
              }}
            >
              <Radio.Item
                id="xDir"
                value="x"
                aria-label="x-axis solbel matrix"
                label="x-axis"
                checked={matrixDir === 'x'}
              />
              <Radio.Item
                id="yDir"
                value="y"
                aria-label="y-axis solbel matrix"
                label="y-axis"
                checked={matrixDir === 'y'}
              />
            </Radio.Group>
          </Flex>
          <Flex alignItems="start" direction="column">
            <Label htmlFor="shader-function">Fragment shader:</Label>
            <Box
              as="select"
              css={{
                border: '2px solid var(--accent)',
                boxShadow: 'none',
                backgroundColor: 'var(--emphasis)',
                color: 'var(--accent)',
                height: '30px',
                borderRadius: 'var(--border-radius-0)',
                padding: '5px',
              }}
              id="shader-function"
              value={shader}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setShader(event.target.value as keyof typeof shaderFunction);
              }}
            >
              <option value="shader1">Half and Half</option>
              <option value="shader2">Vertical Stripes</option>
              <option value="shader3">Horizontal Stripes</option>
              <option value="shader4">Diagonal Stripes</option>
              <option value="shader5">Square</option>
            </Box>
          </Flex>
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
                  disabled={idx === 0 || idy === 0 || idx === 15 || idy === 15}
                  onClick={
                    idx !== 0 && idy !== 0 && idx !== 15 && idy !== 15
                      ? () => onCellClick(idx, idy)
                      : undefined
                  }
                  value={value}
                  kernelValue={getKernelValue(idx, idy)}
                  selected={selectedCell[0] === idx && selectedCell[1] === idy}
                  result={
                    selectedCell[0] === idx && selectedCell[1] === idy
                      ? sobelGradientValue.toString()
                      : null
                  }
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default SobelVisualizer;
