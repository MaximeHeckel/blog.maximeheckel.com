import { forwardRef, ForwardedRef } from 'react';

import * as S from './Grid.styles';
import { GridProps } from './Grid.types';
import GridItem from './GridItem';

interface GridComposition extends React.ForwardRefExoticComponent<
  GridProps & React.RefAttributes<HTMLDivElement>
> {
  Item: typeof GridItem;
}

const Grid = forwardRef(
  (props: GridProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      children,
      css,
      autoColumns,
      autoRows,
      templateAreas,
      templateColumns,
      templateRows,
      ...rest
    } = props;

    return (
      <S.Grid
        css={{
          gridAutoColumns: autoColumns,
          gridAutoRows: autoRows,
          gridTemplateAreas: templateAreas,
          gridTemplateRows: templateRows,
          gridTemplateColumns: templateColumns,
          ...css,
        }}
        {...rest}
        ref={ref}
      >
        {children}
      </S.Grid>
    );
  }
);

Grid.displayName = 'Grid';

const ComposableGrid = {
  ...Grid,
  Item: GridItem,
} as GridComposition;

export default ComposableGrid;
