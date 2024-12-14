import {
  Card,
  Flex,
  Grid,
  Switch,
  Range,
  Box,
} from '@maximeheckel/design-system';
import React, { useDeferredValue, useMemo, useState } from 'react';

import { HighlightedValue } from '../../Components';

const WIDTH = 36;
const HEIGHT = 36;

const shader1 = (_x: number, _y: number) => Math.cos((_y - _x) * 8.0);

const shader2 = (_x: number, _y: number) => {
  const centerX = 0.5;
  const centerY = 0.5;
  const radius = 0.4;

  const distance = Math.sqrt(
    (_x - centerX) * (_x - centerX) + (_y - centerY) * (_y - centerY)
  );

  // Create a sharp edge
  if (distance <= radius) {
    return 1.0 - distance / radius; // Inside the circle
  } else {
    return 0.0; // Outside the circle
  }
};

interface Color {
  r: number;
  g: number;
  b: number;
}

interface CellProps {
  value: number;
  x: number;
  y: number;
  matrix: number[][];
  kuwaharaEnabled: boolean;
  kernelSize: number;
  filterType: string;
}

const luminance = (color: Color): number => {
  return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
};

const SECTOR_COUNT = 8;

const Cell = (props: CellProps) => {
  const { value, x, y, matrix, kuwaharaEnabled, kernelSize, filterType } =
    props;

  const computeBoxStats = (
    offset: { x: number; y: number },
    boxSize: number,
    matrix: number[][]
  ) => {
    const colorSum = { r: 0.0, g: 0.0, b: 0.0 };
    const squaredColorSum = { r: 0.0, g: 0.0, b: 0.0 };
    let sampleCount = 0.0;

    for (let dy = 0; dy < boxSize; dy++) {
      for (let dx = 0; dx < boxSize; dx++) {
        const nx = x + offset.x + dx;
        const ny = y + offset.y + dy;
        if (nx >= 0 && nx < matrix[0].length && ny >= 0 && ny < matrix.length) {
          const v = matrix[ny][nx];
          const color = { r: v, g: v, b: v };

          colorSum.r += color.r;
          colorSum.g += color.g;
          colorSum.b += color.b;

          squaredColorSum.r += color.r * color.r;
          squaredColorSum.g += color.g * color.g;
          squaredColorSum.b += color.b * color.b;

          sampleCount += 1.0;
        }
      }
    }

    if (sampleCount === 0) {
      return { avgColor: { r: 0.5, g: 0.5, b: 0.5 }, variance: 1 };
    }

    const avgColor = {
      r: colorSum.r / sampleCount,
      g: colorSum.g / sampleCount,
      b: colorSum.b / sampleCount,
    };

    const variance3 = {
      r: squaredColorSum.r / sampleCount - avgColor.r * avgColor.r,
      g: squaredColorSum.g / sampleCount - avgColor.g * avgColor.g,
      b: squaredColorSum.b / sampleCount - avgColor.b * avgColor.b,
    };

    const variance = luminance(variance3);

    return { avgColor, variance };
  };

  const computeSectorStats = (
    angle: number,
    radius: number,
    matrix: number[][],
    centerX: number,
    centerY: number
  ) => {
    const colorSum = { r: 0.0, g: 0.0, b: 0.0 };
    const squaredColorSum = { r: 0.0, g: 0.0, b: 0.0 };
    let sampleCount = 0.0;

    for (let r = 0; r <= radius; r += 1) {
      for (let a = -Math.PI / 8; a <= Math.PI / 8; a += Math.PI / 16) {
        const sampleOffset = {
          x: Math.round(r * Math.cos(angle + a)),
          y: Math.round(r * Math.sin(angle + a)),
        };
        const nx = centerX + sampleOffset.x;
        const ny = centerY + sampleOffset.y;
        if (nx >= 0 && nx < matrix[0].length && ny >= 0 && ny < matrix.length) {
          const v = matrix[ny][nx];
          const color = { r: v, g: v, b: v };

          colorSum.r += color.r;
          colorSum.g += color.g;
          colorSum.b += color.b;

          squaredColorSum.r += color.r * color.r;
          squaredColorSum.g += color.g * color.g;
          squaredColorSum.b += color.b * color.b;

          sampleCount += 1.0;
        }
      }
    }

    if (sampleCount === 0) {
      return { avgColor: { r: 0, g: 0, b: 0 }, variance: 0 };
    }

    const avgColor = {
      r: colorSum.r / sampleCount,
      g: colorSum.g / sampleCount,
      b: colorSum.b / sampleCount,
    };

    const variance3 = {
      r: squaredColorSum.r / sampleCount - avgColor.r * avgColor.r,
      g: squaredColorSum.g / sampleCount - avgColor.g * avgColor.g,
      b: squaredColorSum.b / sampleCount - avgColor.b * avgColor.b,
    };

    const variance = luminance(variance3);

    return { avgColor, variance };
  };

  const applyBasicKuwahara = (matrix: number[][], kernelSize: number) => {
    const boxSize = Math.floor(kernelSize / 2);
    const boxAvgColors: Color[] = [];
    const boxVariances: number[] = [];

    // Compute stats for each box
    const offsets = [
      { x: -boxSize, y: -boxSize },
      { x: 0, y: -boxSize },
      { x: -boxSize, y: 0 },
      { x: 0, y: 0 },
    ];

    for (let i = 0; i < offsets.length; i++) {
      const { avgColor, variance } = computeBoxStats(
        offsets[i],
        boxSize,
        matrix
      );
      boxAvgColors[i] = avgColor;
      boxVariances[i] = variance;
    }

    // Find the box with the smallest variance
    let minVariance = boxVariances[0];
    let finalColor = boxAvgColors[0];

    for (let i = 1; i < offsets.length; i++) {
      if (boxVariances[i] < minVariance) {
        minVariance = boxVariances[i];
        finalColor = boxAvgColors[i];
      }
    }

    return luminance(finalColor);
  };

  const applyPapariKuwahara = (
    matrix: number[][],
    kernelSize: number,
    centerX: number,
    centerY: number
  ) => {
    const radius = Math.floor(kernelSize / 2);
    const sectorAvgColors: Color[] = [];
    const sectorVariances: number[] = [];

    for (let i = 0; i < SECTOR_COUNT; i++) {
      const angle = (i * 2 * Math.PI) / SECTOR_COUNT;
      const { avgColor, variance } = computeSectorStats(
        angle,
        radius,
        matrix,
        centerX,
        centerY
      );
      sectorAvgColors[i] = avgColor;
      sectorVariances[i] = variance;
    }

    let minVariance = sectorVariances[0];
    let finalColor = sectorAvgColors[0];

    for (let i = 1; i < SECTOR_COUNT; i++) {
      if (sectorVariances[i] < minVariance) {
        minVariance = sectorVariances[i];
        finalColor = sectorAvgColors[i];
      }
    }

    return luminance(finalColor);
  };

  const applyKuwahara = (
    matrix: number[][],
    kernelSize: number,
    filterType: string,
    centerX: number,
    centerY: number
  ) => {
    if (filterType === 'papari') {
      return applyPapariKuwahara(matrix, kernelSize, centerX, centerY);
    }
    return applyBasicKuwahara(matrix, kernelSize);
  };

  const finalValue = kuwaharaEnabled
    ? applyKuwahara(matrix, kernelSize, filterType, x, y)
    : value;

  const color = `rgb(${finalValue * 48}, ${finalValue * 184}, ${
    finalValue * 255
  })`;

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
      }}
      justifyContent="center"
      style={{
        backgroundColor: color,
      }}
    ></Flex>
  );
};

const shaderFunction = {
  shader1,
  shader2,
};

const KuwaharaVisualizer = (props: { method: 'basic' | 'papari' }) => {
  const { method = 'papari' } = props;
  const [kuwaharaEnabled, setKuwaharaEnabled] = useState<boolean>(false);
  const [kernelSize, setKernelSize] = useState<number>(6);
  const [shader, setShader] = useState<keyof typeof shaderFunction>('shader2');

  const deferredKernelSize = useDeferredValue(kernelSize);

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
            shaderFunction[shader](
              x / (row.length - 1),
              y / (emptyMatrix.length - 1)
            )
          )
        )
        .reverse(),
    [emptyMatrix, shader]
  );

  const toggleKuwahara = () => {
    setKuwaharaEnabled((prev) => !prev);
  };

  const handleKernelSizeChange = (value: number) => {
    setKernelSize(value);
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
          <Switch
            id={`kuwahara-${method}`}
            aria-label="Kuwahara"
            label="Enable Kuwahara filter"
            onChange={toggleKuwahara}
            checked={kuwaharaEnabled}
          />
          <Box
            as="select"
            css={{
              border: '1px solid var(--accent)',
              boxShadow: 'none',
              backgroundColor: 'var(--emphasis)',
              color: 'var(--accent)',
              height: '34px',
              borderRadius: 'var(--border-radius-0)',
              padding: '5px',
            }}
            id="shader-function"
            value={shader}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              setShader(event.target.value as keyof typeof shaderFunction);
            }}
          >
            <option value="shader1">Stripes</option>
            <option value="shader2">Circle</option>
          </Box>
        </Flex>
        <Grid
          css={{
            borderTop: '0.5px solid var(--gray-700)',
            borderRight: '0.5px solid var(--gray-700)',
            width: '100%',
          }}
          templateColumns={`repeat(${WIDTH}, 1fr)`}
        >
          {matrix.map((row, y) => (
            <React.Fragment key={y}>
              {row.map((value, x) => (
                <Cell
                  key={`${value}-${x}-${y}`}
                  value={value}
                  x={x}
                  y={y}
                  matrix={matrix}
                  kuwaharaEnabled={kuwaharaEnabled}
                  kernelSize={deferredKernelSize}
                  filterType={method}
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>
        <Range
          id="kernelSize"
          aria-label="Kernel Size"
          label={
            <span>
              Kernel Size: <HighlightedValue>{kernelSize}</HighlightedValue>
            </span>
          }
          min={2}
          max={12}
          step={2}
          value={kernelSize}
          onChange={handleKernelSizeChange}
          disabled={!kuwaharaEnabled}
        />
      </Card.Body>
    </Card>
  );
};

export default KuwaharaVisualizer;
