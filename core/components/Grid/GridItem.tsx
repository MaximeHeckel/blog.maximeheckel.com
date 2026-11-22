import { ForwardedRef, forwardRef } from 'react';

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
    return (
      <S.GridItem
        css={css}
        style={{
          ...(area && { gridArea: area }),
          ...((col || colSpan) && {
            gridColumn: col || spanToCSSValue(colSpan),
          }),
          ...((row || rowSpan) && { gridRow: row || spanToCSSValue(rowSpan) }),
          ...(colStart && { gridColumnStart: colStart }),
          ...(colEnd && { gridColumnEnd: colEnd }),
          ...(rowStart && { gridRowStart: rowStart }),
          ...(rowEnd && { gridRowEnd: rowEnd }),
          ...style,
        }}
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
