import { css } from '@emotion/react';
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
          css={css`
            z-index: 1;
            display: flex;
          `}
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
          css={css`
            margin-right: 8px;
          `}
        >
          {startIcon}
        </span>
      ) : null}
      {children}
      {endIcon ? (
        <span
          css={css`
            margin-left: 8px;
          `}
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
