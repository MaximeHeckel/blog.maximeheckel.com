import { forwardRef, type CSSProperties, type ForwardedRef } from 'react';

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
      style,
      autoColumns,
      autoRows,
      templateAreas,
      templateColumns,
      templateRows,
      ...rest
    } = props;

    return (
      <S.Grid
        css={css}
        style={
          {
            '--grid-auto-columns': autoColumns ?? 'initial',
            '--grid-auto-rows': autoRows ?? 'initial',
            '--grid-template-areas': templateAreas ?? 'initial',
            '--grid-template-rows': templateRows ?? 'initial',
            '--grid-template-columns': templateColumns ?? 'initial',
            ...style,
          } as CSSProperties
        }
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
