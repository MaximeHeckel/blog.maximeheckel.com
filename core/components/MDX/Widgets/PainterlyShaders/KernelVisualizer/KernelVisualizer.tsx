import {
  Card,
  Flex,
  Grid,
  Switch,
  Text,
  Box,
  Tooltip,
  Icon,
  Button,
} from '@maximeheckel/design-system';
import React, { useMemo, useState, useEffect } from 'react';

import { Select } from '@core/components/Select';

const WIDTH = 9;
const HEIGHT = 9;

const shader1 = (_x: number, _y: number) => {
  const randomValue = Math.random();
  return 0.3 + randomValue * 0.7; // This clamps the value between 0.3 and 1
};

const shader2 = (_x: number, _y: number) => {
  const randomValue = Math.random();
  // Shift the diagonal by half a cell
  return _x + 0.25 >= _y ? 0.6 + randomValue * 0.4 : 0.0;
};

const shader3 = (_x: number, _y: number) => {
  const randomValue = Math.random();
  // Shift the diagonal by half a cell
  return _x + 0.1 >= _y ? 0.6 + randomValue * 0.4 : 0.0;
};

type SectorStats = {
  sectorIndex: number;
  average: number;
  variance: number;
};

interface CellProps {
  value: number;
  isCenter: boolean;
  lowestSector: SectorStats | null;
}

const Cell = (props: CellProps) => {
  const { value, isCenter, lowestSector } = props;

  const color = `rgb(${value * 48}, ${value * 184}, ${value * 255})`;

  return (
    <Flex
      alignItems="center"
      css={{
        aspectRatio: '1 / 1',
        borderBottom: '1px solid var(--gray-700)',
        borderLeft: '1px solid var(--gray-700)',
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
        color: 'white',
        ...(isCenter && {
          boxShadow: '0 0 15px var(--accent)',
          border: '2px solid var(--accent)',
          borderRadius: 'var(--border-radius-2)',
          zIndex: 2,
        }),
      }}
      justifyContent="center"
      suppressHydrationWarning
      style={{
        backgroundColor:
          isCenter && lowestSector
            ? `rgb(${lowestSector.average * 36}, ${
                lowestSector.average * 115
              }, ${lowestSector.average * 190})`
            : color,
      }}
    >
      {isCenter ? (
        <>
          {lowestSector ? (
            <Text
              as="p"
              css={{
                fontVariantNumeric: 'tabular-nums',
              }}
              family="mono"
              weight="3"
            >
              Val: {lowestSector?.average.toFixed(3)}
            </Text>
          ) : (
            <Text
              as="p"
              css={{
                fontVariantNumeric: 'tabular-nums',
              }}
              family="mono"
              weight="3"
            >
              Val: {value.toFixed(3)}
            </Text>
          )}
        </>
      ) : null}
    </Flex>
  );
};

interface SectorProps {
  columnStart: number;
  rowStart: number;
  sectorStat: SectorStats;
}

const Sector = (props: SectorProps) => {
  const { columnStart, rowStart, sectorStat } = props;

  return (
    <Flex
      alignItems="center"
      css={{
        background: 'oklch(from var(--accent) l c h / 0.5)',
        border: '2px solid var(--accent)',
        borderRadius: 'var(--border-radius-2)',
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 3,
        color: 'white',
      }}
      direction="column"
      justifyContent="center"
      style={{
        gridColumn: `${columnStart} / span ${Math.floor(WIDTH / 2)}`,
        gridRow: `${rowStart} / span ${Math.floor(WIDTH / 2)}`,
      }}
    >
      <Box css={{ display: 'contents' }}>
        <Text as="p" weight="3">
          Sector {sectorStat.sectorIndex + 1}
        </Text>
        <Text
          as="p"
          css={{
            fontVariantNumeric: 'tabular-nums',
          }}
          family="mono"
          weight="3"
        >
          Avg: {sectorStat.average.toFixed(3)}
        </Text>
        <Text
          as="p"
          css={{
            fontVariantNumeric: 'tabular-nums',
          }}
          family="mono"
          weight="3"
        >
          Var: {sectorStat.variance.toFixed(3)}
        </Text>
      </Box>
    </Flex>
  );
};

const shaderFunction = {
  shader1,
  shader2,
  shader3,
};

const shaderOptions = [
  { label: 'Filled', value: 'shader1' },
  { label: 'Edge 1', value: 'shader2' },
  { label: 'Edge 2', value: 'shader3' },
];

const KuwaharaVisualizer = () => {
  const [sectorsEnabled, setSectorsEnabled] = useState<boolean>(false);
  const [lowestSector, setLowestSector] = useState<SectorStats | null>(null);
  const [key, setKey] = useState(0);
  const [shader, setShader] = useState<keyof typeof shaderFunction>('shader2');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emptyMatrix, key, shader] // Keep key as dependency
  );

  const centerX = Math.floor(WIDTH / 2);
  const centerY = Math.floor(HEIGHT / 2);

  const toggleSectors = () => {
    setSectorsEnabled((prev) => !prev);
  };

  const incrementKey = () => setKey((prevKey) => prevKey + 1);

  const calculateSectorStats = (
    matrix: number[][],
    centerX: number,
    centerY: number
  ) => {
    const sectors = [
      {
        startX: centerX - Math.floor(WIDTH / 2),
        endX: centerX - 1,
        startY: centerY - Math.floor(WIDTH / 2),
        endY: centerY - 1,
      }, // Top-left
      {
        startX: centerX + 1,
        endX: centerX + Math.floor(WIDTH / 2),
        startY: centerY - Math.floor(WIDTH / 2),
        endY: centerY - 1,
      }, // Top-right
      {
        startX: centerX - Math.floor(WIDTH / 2),
        endX: centerX - 1,
        startY: centerY + 1,
        endY: centerY + Math.floor(WIDTH / 2),
      }, // Bottom-left
      {
        startX: centerX + 1,
        endX: centerX + 3,
        startY: centerY + 1,
        endY: centerY + 3,
      }, // Bottom-right
    ];

    return sectors.map((sector, index) => {
      const values = [];
      for (let y = sector.startY; y <= sector.endY; y++) {
        for (let x = sector.startX; x <= sector.endX; x++) {
          if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
            values.push(matrix[y][x]);
          }
        }
      }

      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
        values.length;

      return { sectorIndex: index, average, variance };
    });
  };

  const sectorStats = useMemo(
    () => calculateSectorStats(matrix, centerX, centerY),
    [matrix, centerX, centerY]
  );

  useEffect(() => {
    // Find the sector with the lowest variance
    const lowestVarianceSector = sectorStats.reduce((prev, current) =>
      prev.variance < current.variance ? prev : current
    );

    setLowestSector(lowestVarianceSector);
  }, [sectorStats]);

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
            id="enable-sectors"
            aria-label="Display Sectors"
            label="Display Sectors"
            onChange={toggleSectors}
            checked={sectorsEnabled}
          />
          <Flex gap="2">
            <Select
              id="shader-function"
              items={shaderOptions}
              value={shader}
              onChange={(value) =>
                setShader(value as keyof typeof shaderFunction)
              }
            />
            <Tooltip content="Randomize">
              <Button
                icon={<Icon.Repeat />}
                onClick={incrementKey}
                variant="icon"
              />
            </Tooltip>
          </Flex>
        </Flex>
        <Grid
          css={{
            borderTop: '1px solid var(--gray-700)',
            borderRight: '1px solid var(--gray-700)',
            width: '100%',
            position: 'relative',
          }}
          templateColumns={`repeat(${WIDTH}, 1fr)`}
          templateRows={`repeat(${HEIGHT}, 1fr)`}
        >
          {matrix.map((row, y) => (
            <React.Fragment key={y}>
              {row.map((value, x) => (
                <Cell
                  key={`${value}-${x}-${y}`}
                  value={value}
                  isCenter={sectorsEnabled && x === centerX && y === centerY}
                  lowestSector={sectorsEnabled ? lowestSector : null}
                />
              ))}
            </React.Fragment>
          ))}
          {sectorsEnabled ? (
            <>
              <Sector
                columnStart={1}
                rowStart={1}
                sectorStat={sectorStats[0]}
              />
              <Sector
                columnStart={Math.floor(WIDTH / 2) + 2}
                rowStart={1}
                sectorStat={sectorStats[1]}
              />
              <Sector
                columnStart={1}
                rowStart={Math.floor(WIDTH / 2) + 2}
                sectorStat={sectorStats[2]}
              />
              <Sector
                columnStart={Math.floor(WIDTH / 2) + 2}
                rowStart={Math.floor(WIDTH / 2) + 2}
                sectorStat={sectorStats[3]}
              />
            </>
          ) : null}
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default KuwaharaVisualizer;
