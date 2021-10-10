import React from 'react';
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
        <span
          css={{
            zIndex: 1,
            display: 'flex',
          }}
        >
          {icon}
        </span>
      </StyledIconButton>
    );
  }

  return (
    <StyledButton variant={variant} as={Component} ref={ref} {...rest}>
      {startIcon ? (
        <span
          css={{
            marginRight: '8px',
          }}
        >
          {startIcon}
        </span>
      ) : null}
      {children}
      {endIcon ? (
        <span
          css={{
            marginLeft: '8px',
          }}
        >
          {endIcon}
        </span>
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
