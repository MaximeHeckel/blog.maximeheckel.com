import { ForwardedRef, forwardRef } from 'react';

import * as S from './Grid.styles';
import { GridItemProps } from './Grid.types';
import { spanToCSSValue } from './utils';

const GridItem = forwardRef(
  (props: GridItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      area,
      css,
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
        css={{
          gridArea: area,
          gridColumn: col || spanToCSSValue(colSpan),
          gridRow: row || spanToCSSValue(rowSpan),
          gridColumnStart: colStart,
          gridColumnEnd: colEnd,
          gridRowStart: rowStart,
          gridRowEnd: rowEnd,
          ...css,
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
