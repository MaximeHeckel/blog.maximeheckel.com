import type { StyledVariantProps as VariantProps } from 'styled-system/jsx';
import type { SystemStyleObject as CSS } from 'styled-system/types';

import Text from '../Typography';

export interface ComponentOrTextProps {
  children: React.ReactNode;
  variant?: VariantProps<typeof Text>['variant'];
  css?: CSS;
}
