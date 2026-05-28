import { Text } from '@maximeheckel/design-system';
import type { ReactNode } from 'react';

export interface HeadlineProps {
  children: ReactNode;
  'data-testid'?: string;
  letterSpacing?: string;
  textAlign?: 'center' | 'left' | 'right';
}

const Headline = (props: HeadlineProps) => {
  const {
    children,
    'data-testid': dataTestId,
    letterSpacing = '-0.022em',
    textAlign = 'left',
  } = props;

  return (
    <Text
      as="h1"
      css={{
        fontWeight: 510,
        letterSpacing,
        lineHeight: 1.2,
        textWrap: 'balance',
        textAlign,
        fontVariationSettings: '"opsz" 28',
        fontOpticalSizing: 'none',
      }}
      data-testid={dataTestId}
      family="display"
      size="6"
      variant="primary"
    >
      {children}
    </Text>
  );
};

export default Headline;
