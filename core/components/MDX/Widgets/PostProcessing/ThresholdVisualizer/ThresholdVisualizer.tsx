import { Box, Card, Flex, Grid, Range } from '@maximeheckel/design-system';
import React, { useMemo, useState } from 'react';

import { HighlightedValue } from '../../Components';

const WIDTH = 4;

interface CellProps {
  value: number;
  luma: number;
}

const Cell = (props: CellProps) => {
  const { value, luma } = props;

  const [cellValue, setCellValue] = useState(value);

  let color = 'black';

  if (luma >= cellValue) {
    color = `rgba(0, 141, 247,1)`;
  }

  return (
    <Grid.Item
      css={{
        aspectRatio: '1 / 1',
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: color,
        alignContent: 'center',
        borderBottom: '0.5px solid var(--gray-700)',
        borderLeft: '0.5px solid var(--gray-700)',
      }}
    >
      <Box
        as="input"
        type="number"
        min={0}
        max={1}
        step={0.01}
        css={{
          all: 'unset',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          fontSize: 'var(--font-size-1)',
          '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
          },
          '&[type=number]': {
            '-moz-appearance': 'textfield',
          },
        }}
        value={cellValue}
        onChange={(event) => setCellValue(Number(event.target.value))}
      />
    </Grid.Item>
  );
};

const emptyMatrix = [
  [0.75, 1.0, 1.0, 0.75],
  [1.0, 0.5, 0.25, 1.0],
  [1.0, 0.25, 0.5, 1.0],
  [0.75, 1.0, 1.0, 0.75],
];

const ThresholdVisualizer = () => {
  const [luma, setLuma] = useState(0.5);

  const handleLumaChange = (value: number) => {
    setLuma(value);
  };

  const matrix = useMemo(
    () =>
      emptyMatrix
        .map((row, y) =>
          row.map((_, x) => {
            return {
              value: emptyMatrix[y][x],
            };
          })
        )
        .reverse(),
    []
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
              {row.map(({ value }, x) => (
                <Cell key={`${x}-${y}`} value={value} luma={luma} />
              ))}
            </React.Fragment>
          ))}
        </Grid>
        <Range
          id="pixelation"
          aria-label="Pixelation"
          label={
            <span>
              Luma: <HighlightedValue>{luma}</HighlightedValue>
            </span>
          }
          min={0.0}
          max={1.0}
          step={0.01}
          value={luma}
          onChange={handleLumaChange}
        />
      </Card.Body>
    </Card>
  );
};

export default ThresholdVisualizer;
