import type { HTMLAttributes } from 'react';
import type { SystemStyleObject as CSS } from 'styled-system/types';

export type AspectRatioValue = '9:16' | '4:5' | '1:1' | '4:3' | '16:9';

export interface AspectRatioProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Selected crop. Omit to let the component manage its selection. */
  value?: AspectRatioValue;
  defaultValue?: AspectRatioValue;
  onValueChange?: (value: AspectRatioValue) => void;
  disabled?: boolean;
  /** Accessible name of the preset selector. */
  label?: string;
  css?: CSS;
}
