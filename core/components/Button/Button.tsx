import React from 'react';
import Flex from '../Flex';
import { StyledButton, StyledIconButton } from './Styles';
import { ButtonProps } from './types';

const Button = <T extends object>(
  props: ButtonProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const {
    variant = 'primary',
    children,
    icon,
    startIcon,
    endIcon,
    as: Component,
    ...rest
  } = props;

  if (variant === 'icon') {
    return (
      <StyledIconButton variant={variant} as={Component} ref={ref} {...rest}>
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
    <StyledButton variant={variant} as={Component} ref={ref} {...rest}>
      {startIcon ? (
        <Flex
          css={{
            marginRight: '8px',
          }}
        >
          {startIcon}
        </Flex>
      ) : null}
      {children}
      {endIcon ? (
        <Flex
          css={{
            marginLeft: '8px',
          }}
        >
          {endIcon}
        </Flex>
      ) : null}
    </StyledButton>
  );
};
Button.displayName = 'Button';

const ForwardedButton = React.forwardRef(Button);

export const WrappedButton = <T,>({
  ref,
  ...rest
}: ButtonProps<T> & { ref?: React.Ref<HTMLButtonElement> }) => (
  <ForwardedButton {...rest} ref={ref} />
);

export default WrappedButton;
