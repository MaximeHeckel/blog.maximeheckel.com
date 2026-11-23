import React from 'react';

import { DEFAULT_TAG } from './Typography.constants';
import {
  HeadingProps,
  HeadingSizeVariants,
  ShortHandHeadingProps,
  TextSizeVariants,
} from './Typography.types';
import Text from './TypographyText';

const Heading = (props: HeadingProps) => {
  const { size = '1', ...rest } = props;

  const headingSize: Record<HeadingSizeVariants, TextSizeVariants['size']> = {
    1: '4',
    2: '5',
    3: '6',
    4: '7',
  };

  return (
    <Text
      as={DEFAULT_TAG}
      {...rest}
      size={headingSize[size]}
      css={{
        fontWeight: 'var(--font-weight-600)',
        lineHeight: '1.5',
        letterSpacing: '-0.3px',
        ...props.css,
      }}
    />
  );
};

export const H1 = React.forwardRef<
  React.ElementRef<'h1'>,
  ShortHandHeadingProps
>((props, ref) => (
  <Heading
    {...props}
    ref={ref}
    as="h1"
    size="4"
    spaced={false}
    variant="primary"
  />
));

H1.displayName = 'H1';

export const H2 = (props: ShortHandHeadingProps) => (
  <Heading {...props} as="h2" size="3" spaced={false} variant="primary" />
);

H2.displayName = 'H2';

export const H3 = (props: ShortHandHeadingProps) => (
  <Heading {...props} as="h3" size="2" spaced={false} variant="primary" />
);

H3.displayName = 'H3';

export const H4 = (props: ShortHandHeadingProps) => (
  <Heading {...props} as="h4" size="1" spaced={false} variant="primary" />
);

H4.displayName = 'H4';

Heading.displayName = 'Heading';

export default Heading;
