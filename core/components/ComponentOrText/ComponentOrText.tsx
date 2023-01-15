import { Box, Text } from '@maximeheckel/design-system';
import React from 'react';
import { ComponentOrTextProps } from './types';

const ComponentOrText = (props: ComponentOrTextProps) => {
  const { children, variant, css } = props;

  if (typeof children === 'string') {
    return (
      <Text
        css={{ margin: 0, ...css }}
        as="p"
        size="2"
        variant={variant}
        weight="3"
      >
        {children}
      </Text>
    );
  }

  return (
    <Box
      css={{
        ...css,
        '& p': {
          margin: 0,
        },
      }}
    >
      {children}
    </Box>
  );
};

export default ComponentOrText;
