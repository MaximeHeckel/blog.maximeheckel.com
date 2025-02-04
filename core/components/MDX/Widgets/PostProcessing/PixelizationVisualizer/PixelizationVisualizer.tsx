import {
  Box,
  Card,
  Flex,
  Grid,
  Range,
  Switch,
  Text,
} from '@maximeheckel/design-system';
import React, { useDeferredValue, useMemo, useState } from 'react';

import { HighlightedValue } from '../../Components';

const WIDTH = 16;
const HEIGHT = 16;

const patterns = {
  dots: (relX: number, relY: number, intensity: number) => {
    const gridX = Math.floor(relX * 4);
    const gridY = Math.floor(relY * 4);

    if (intensity <= 0.25) return false;

    if (intensity <= 0.5) {
      return gridX === 2 && gridY === 2;
    }

    if (intensity <= 1.0) {
      return (gridX === 3 || gridX === 0) && (gridY === 3 || gridY === 0);
    }
  },
  lines: (relX: number, _relY: number, intensity: number) => {
    const gridX = Math.floor(relX * 4);
    if (intensity <= 0.25) return false;

    if (intensity <= 0.5) {
      return gridX === 2;
    }

    if (intensity <= 0.75) {
      return gridX === 2 || gridX === 3;
    }

    if (intensity <= 1) {
      return true;
    }
  },
  crosshatch: (relX: number, relY: number, intensity: number) => {
    const lineWidth = 0.45;
    const diagonal1 = Math.abs(relY - relX) < lineWidth * intensity;
    const diagonal2 = Math.abs(relY - (1 - relX)) < lineWidth * intensity;
    return diagonal1 || diagonal2;
  },
  squares: (relX: number, relY: number, value: number) => {
    const gridX = Math.floor(relX * 4);
    const gridY = Math.floor(relY * 4);

    if (value <= 0.25) return false;

    if (value <= 0.75) {
      const isInCenter =
        gridX === 1 || gridX === 2 || gridY === 1 || gridY === 2;

      if (value <= 0.5) {
        return !isInCenter;
      }
      if (value <= 0.75) {
        return isInCenter;
      }
    }
    return true;
  },
};

// Shader-like function to simulate a circle mask
const shader = (x: number, y: number) => {
  const centerX = 0.5;
  const centerY = 0.5;
  const radius = 0.35;

  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

  return distance <= radius + 0.1 ? 1.0 - distance / 0.7 : 0.0;
};

interface CellProps {
  originalUV: number[];
  snappedUV: number[];
  value: number;
  pixelation: number;
  enablePatterns: boolean;
  pattern: string;
}

const Cell = (props: CellProps) => {
  const { originalUV, snappedUV, value, pixelation, enablePatterns, pattern } =
    props;

  const gridX = Math.floor(originalUV[0] * (WIDTH - 1));
  const gridY = Math.floor(originalUV[1] * (HEIGHT - 1));

  const isRightBorder = (gridX + 1 + pixelation / 2) % pixelation === 0;
  const isTopBorder = (gridY + 1 + pixelation / 2) % pixelation === 0;
  const isLeftBorder = (gridX + pixelation / 2) % pixelation === 0;
  const isBottomBorder = (gridY + pixelation / 2) % pixelation === 0;

  // Calculate relative position within the cell
  const relX = ((originalUV[0] * (WIDTH - 1)) % pixelation) / pixelation;
  const relY = ((originalUV[1] * (HEIGHT - 1)) % pixelation) / pixelation;

  // Determine if this point should be colored based on the pattern
  const patternVisible = enablePatterns
    ? patterns[pattern as keyof typeof patterns](relX, relY, value)
    : false;

  let color = 'transparent';

  if (enablePatterns) {
    if (patternVisible) {
      color = 'rgba(0, 141, 247, 1)';
    } else {
      color = 'black';
    }
  } else {
    color = `rgba(${value * 0}, ${value * 141}, ${value * 247})`;
  }

  return (
    <Grid.Item
      data-cell-id={`${originalUV[0]}-${originalUV[1]}`}
      css={{
        all: 'unset',
        aspectRatio: '1 / 1',
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: color,
        alignContent: 'center',
        borderRight: isRightBorder
          ? '0.5px solid var(--blue-700)'
          : '0.5px solid transparent',
        borderTop: isTopBorder
          ? '0.5px solid var(--blue-700)'
          : '0.5px solid transparent',
        borderBottom: isBottomBorder
          ? '0.5px solid var(--blue-700)'
          : '0.5px solid var(--gray-700)',
        borderLeft: isLeftBorder
          ? '0.5px solid var(--blue-700)'
          : '0.5px solid var(--gray-700)',
      }}
    >
      {(originalUV[0] === 0 && originalUV[1] === 0) ||
      (originalUV[0] === 1 && originalUV[1] === 1) ||
      (originalUV[0] === 0 && originalUV[1] === 1) ||
      (originalUV[0] === 1 && originalUV[1] === 0) ? (
        <Text
          css={{
            fontSize: '10px',
            userSelect: 'none',
            color: 'var(--gray-900)',
          }}
        >
          {snappedUV[0].toFixed(1)},{snappedUV[1].toFixed(1)}
        </Text>
      ) : null}
    </Grid.Item>
  );
};

const PixelizationVisualizer = (props: { showPatterns?: boolean }) => {
  const { showPatterns = false } = props;
  const [pixelation, setPixelation] = useState(showPatterns ? 4 : 1);
  const [enablePatterns, setEnablePatterns] = useState(false);
  const [pattern, setPattern] = useState('squares');
  const deferredPixelation = useDeferredValue(pixelation);

  const emptyMatrix = useMemo(
    () =>
      Array(HEIGHT)
        .fill(null)
        .map(() => Array(WIDTH).fill(null)),
    []
  );

  const handlePixelationChange = (value: number) => {
    const powerOf2 = Math.pow(2, value - 1);
    setPixelation(powerOf2);
  };

  const handleTogglePatterns = () => {
    setEnablePatterns(!enablePatterns);
  };

  const matrix = useMemo(
    () =>
      emptyMatrix
        .map((row, y) =>
          row.map((_, x) => {
            const originalUV = [
              x / (row.length - 1),
              y / (emptyMatrix.length - 1),
            ];

            const snappedUV = [
              Math.floor(originalUV[0] * (WIDTH / deferredPixelation) + 0.5) /
                (WIDTH / deferredPixelation),
              Math.floor(originalUV[1] * (HEIGHT / deferredPixelation) + 0.5) /
                (HEIGHT / deferredPixelation),
            ];

            return {
              originalUV,
              snappedUV,
              value: shader(snappedUV[0], snappedUV[1]),
            };
          })
        )
        .reverse(),
    [emptyMatrix, deferredPixelation]
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
        {showPatterns ? (
          <Flex
            alignItems="center"
            justifyContent="space-between"
            css={{ width: '100%' }}
          >
            <Switch
              id={`patterns-${showPatterns}`}
              aria-label="Patterns"
              label="Enable Patterns"
              onChange={handleTogglePatterns}
              checked={enablePatterns}
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
              id="pattern-function"
              value={pattern}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setPattern(event.target.value as keyof typeof patterns);
              }}
            >
              <option value="crosshatch">Crosshatch</option>
              <option value="dots">Dots</option>
              <option value="lines">Lines</option>
              <option value="squares">Squares</option>
            </Box>
          </Flex>
        ) : null}
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
              {row.map(({ originalUV, snappedUV, value }, x) => (
                <Cell
                  key={`${x}-${y}`}
                  pixelation={deferredPixelation}
                  originalUV={originalUV}
                  enablePatterns={enablePatterns}
                  pattern={pattern}
                  snappedUV={snappedUV}
                  value={value}
                />
              ))}
            </React.Fragment>
          ))}
        </Grid>
        {showPatterns ? null : (
          <Range
            id="pixelation"
            aria-label="Pixelation"
            label={
              <span>
                Pixelation:{' '}
                <HighlightedValue>
                  {pixelation} x {pixelation}
                </HighlightedValue>
              </span>
            }
            min={1}
            max={4}
            value={Math.log2(pixelation) + 1}
            onChange={handlePixelationChange}
          />
        )}
      </Card.Body>
    </Card>
  );
};

export default PixelizationVisualizer;
