import { SVGAttributes } from 'react';
import { IconSize, IconVariant } from './StyledIcons';

export interface IconProps extends SVGAttributes<SVGElement> {
  size?: IconSize;
  variant?: IconVariant;
}
