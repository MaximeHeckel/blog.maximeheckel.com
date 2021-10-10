import { styled } from 'lib/stitches.config';
import React from 'react';

type Alignements =
  | 'auto'
  | 'normal'
  | 'start'
  | 'end'
  | 'center'
  | 'left'
  | 'right'
  | 'stretch'
  | 'self-start'
  | 'self-end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe center'
  | 'unsafe center'
  | 'legacy right'
  | 'legacy left'
  | 'legacy center';

interface Props extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  children: React.ReactNode | React.ReactNodeArray;
  gap?: number | string;
  columnGap?: number | string;
  rowGap?: number | string;
  columns?: string;
  rows?: string;
  flow?: 'row' | 'column' | 'row dense' | 'column dense';
  alignContent?: Alignements;
  alignItems?: Alignements;
  justifyContent?: Alignements;
  justifyItems?: Alignements;
  'data-testid'?: string;
}

const StyledGrid = styled('div', {
  display: 'grid',
  height: 'inherit',
});

const Grid = (props: Props) => {
  const {
    as = 'div',
    gap = 'none',
    rowGap = 'none',
    columnGap = 'none',
    columns,
    rows,
    flow = 'row',
    alignContent,
    alignItems,
    justifyContent,
    justifyItems,
    ...rest
  } = props;

  const sanitizedGap = typeof gap === 'number' ? `${gap}px` : gap;
  const sanitizedRowGap = typeof rowGap === 'number' ? `${rowGap}px` : rowGap;
  const sanitizedColumnGap =
    typeof columnGap === 'number' ? `${columnGap}px` : columnGap;
  const sanitizedColumns = columns || 'none';
  const sanitizedRows = rows || 'none';

  return (
    <StyledGrid
      as={as}
      css={{
        gap: sanitizedGap,
        columnGap: sanitizedColumnGap,
        rowGap: sanitizedRowGap,
        gridAutoFlow: flow,
        gridTemplateColumns: sanitizedColumns,
        gridTemplateRows: sanitizedRows,
        alignContent,
        alignItems,
        justifyContent,
        justifyItems,
      }}
      {...rest}
    >
      {props.children}
    </StyledGrid>
  );
};

export default Grid;
