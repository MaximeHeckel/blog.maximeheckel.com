import React, { JSX } from 'react';

import Flex from '../Flex';
import { StyledIconButton } from './Button.styles';
import { IconButtonProps } from './Button.types';

const IconButton = React.forwardRef(
  <T extends object>(
    props: IconButtonProps<T>,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const { variant = 'secondary', children, ...rest } = props;

    if (!React.isValidElement(children)) {
      // eslint-disable-next-line no-console
      console.error('Children must be a valid icon');
    }

    // TODO validate that the children is an Icon
    return (
      <StyledIconButton variant={variant} ref={ref} {...rest}>
        <Flex
          css={{
            zIndex: 1,
          }}
        >
          {children}
        </Flex>
      </StyledIconButton>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton as <T extends object>(
  props: IconButtonProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => JSX.Element;
