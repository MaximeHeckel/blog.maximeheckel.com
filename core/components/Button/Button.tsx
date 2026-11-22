import React, { JSX } from 'react';

import Flex from '../Flex';
import { StyledButton, StyledIconButton } from './Button.styles';
import { ButtonProps } from './Button.types';

const Button = React.forwardRef(
  <T extends object>(
    props: ButtonProps<T>,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const {
      variant = 'primary',
      children,
      icon,
      startIcon,
      endIcon,
      ...rest
    } = props;

    // Fallback to previous implementation of icon button if variant is "icon"
    // TODO: Deprecate variant "icon" in favor of IconButton component
    if (variant === 'icon') {
      return (
        <StyledIconButton variant="tertiary" ref={ref} {...rest}>
          <Flex
            css={{
              zIndex: 1,
            }}
          >
            {icon}
          </Flex>
        </StyledIconButton>
      );
    }

    return (
      <StyledButton
        hasIcon={startIcon ? 'startIcon' : endIcon ? 'endIcon' : 'none'}
        variant={variant}
        ref={ref}
        {...rest}
      >
        {startIcon ? (
          <Flex
            css={{
              marginRight: 'var(--space-1)',
            }}
          >
            {startIcon}
          </Flex>
        ) : null}
        {children}
        {endIcon ? (
          <Flex
            css={{
              marginLeft: 'var(--space-1)',
            }}
          >
            {endIcon}
          </Flex>
        ) : null}
      </StyledButton>
    );
  }
);
Button.displayName = 'Button';

export default Button as <T extends object>(
  props: ButtonProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => JSX.Element;
