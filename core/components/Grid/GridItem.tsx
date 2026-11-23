import { forwardRef, type CSSProperties, type ForwardedRef } from 'react';

import * as S from './Grid.styles';
import { GridItemProps } from './Grid.types';
import { spanToCSSValue } from './utils';

const GridItem = forwardRef(
  (props: GridItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      area,
      css,
      style,
      children,
      row,
      col,
      colStart,
      colSpan,
      colEnd,
      rowStart,
      rowSpan,
      rowEnd,
      ...rest
    } = props;
    const gridColumn = col || spanToCSSValue(colSpan);
    const gridRow = row || spanToCSSValue(rowSpan);

    return (
      <S.GridItem
        css={{
          ...(area && { gridArea: 'var(--grid-item-area)' }),
          ...(gridColumn && { gridColumn: 'var(--grid-item-column)' }),
          ...(gridRow && { gridRow: 'var(--grid-item-row)' }),
          ...(colStart && { gridColumnStart: 'var(--grid-item-column-start)' }),
          ...(colEnd && { gridColumnEnd: 'var(--grid-item-column-end)' }),
          ...(rowStart && { gridRowStart: 'var(--grid-item-row-start)' }),
          ...(rowEnd && { gridRowEnd: 'var(--grid-item-row-end)' }),
          ...css,
        }}
        style={
          {
            '--grid-item-area': area,
            '--grid-item-column': gridColumn,
            '--grid-item-row': gridRow,
            '--grid-item-column-start': colStart || undefined,
            '--grid-item-column-end': colEnd || undefined,
            '--grid-item-row-start': rowStart || undefined,
            '--grid-item-row-end': rowEnd || undefined,
            ...style,
          } as CSSProperties
        }
        ref={ref}
        {...rest}
      >
        {children}
      </S.GridItem>
    );
  }
);

GridItem.displayName = 'GridItem';

export default GridItem;
