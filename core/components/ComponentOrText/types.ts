import { CSS, Text, VariantProps } from '@maximeheckel/design-system';

export interface ComponentOrTextProps {
  children: React.ReactNode;
  variant?: VariantProps<typeof Text>['variant'];
  css?: CSS;
}
