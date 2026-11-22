import { CSS, VariantProps } from 'lib/stitches.config';

import { DEFAULT_TAG } from './Typography.constants';
import Text from './TypographyText';

export type TextSizeVariants = {
  size?: VariantProps<typeof Text>['size'];
  variant?: VariantProps<typeof Text>['variant'];
};

export type EMProps = React.HTMLAttributes<HTMLParagraphElement> &
  TextSizeVariants;
export type StrongProps = React.HTMLAttributes<HTMLParagraphElement> &
  TextSizeVariants;

export type HeadingSizeVariants = '1' | '2' | '3' | '4';
export type HeadingVariants = { size?: HeadingSizeVariants } & Omit<
  VariantProps<typeof Text>,
  'size'
>;

export type HeadingProps = React.ComponentProps<typeof DEFAULT_TAG> &
  HeadingVariants & { css?: CSS; as?: React.ElementType };

export type ShortHandHeadingProps = Omit<HeadingProps, 'size' | 'as'>;
