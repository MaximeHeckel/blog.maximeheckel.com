import type { StyledVariantProps as VariantProps } from 'styled-system/jsx';
import type { SystemStyleObject as CSS } from 'styled-system/types';

import * as S from './Grid.styles';

export type FlowVariantType = VariantProps<typeof S.Grid>['flow'];
export type AlignVariantType = VariantProps<typeof S.Grid>['align'];
export type JustifyVariantType = VariantProps<typeof S.Grid>['justify'];
export type GapVariantType = VariantProps<typeof S.Grid>['gap'];
export type GapXVariantType = VariantProps<typeof S.Grid>['gapX'];
export type GapYVariantType = VariantProps<typeof S.Grid>['gapY'];

export type AlignSelfVariantType = VariantProps<typeof S.GridItem>['alignSelf'];
export type JustifySelfVariantType = VariantProps<
  typeof S.GridItem
>['justifySelf'];
export type PlaceSelfVariantType = VariantProps<typeof S.GridItem>['placeSelf'];

export interface GridItemProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  area?: string;
  col?: number;
  colEnd?: number;
  colSpan?: number;
  colStart?: number;
  css?: CSS;
  style?: React.CSSProperties;
  className?: string;
  row?: number;
  rowEnd?: number;
  rowSpan?: number;
  rowStart?: number;
  justifySelf?: JustifySelfVariantType;
  alignSelf?: AlignSelfVariantType;
  placeSelf?: PlaceSelfVariantType;
}

export interface GridProps {
  as?: React.ElementType;
  autoColumns?: string;
  autoRows?: string;
  flow?: FlowVariantType;
  justify?: JustifyVariantType;
  align?: AlignVariantType;
  gap?: GapVariantType;
  gapY?: GapYVariantType;
  gapX?: GapXVariantType;
  templateAreas?: string;
  templateRows?: string;
  templateColumns?: string;
  children?: React.ReactNode;
  css?: CSS;
  style?: React.CSSProperties;
  className?: string;
}
