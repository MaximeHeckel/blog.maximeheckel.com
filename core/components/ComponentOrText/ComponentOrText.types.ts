import { CSS, VariantProps } from 'lib/stitches.config';

import Text from '../Typography';

export interface ComponentOrTextProps {
  children: React.ReactNode;
  variant?: VariantProps<typeof Text>['variant'];
  css?: CSS;
}
