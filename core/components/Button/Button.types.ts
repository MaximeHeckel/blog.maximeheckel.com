import type { VariantProps } from 'lib/stitches.config';

import type { StyledIconButton } from './Button.styles';

export type MainButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'icon';
export type IconButtonVariant = 'primary' | 'secondary' | 'tertiary';

type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface MainButtonProps extends BaseButtonProps {
  variant?: MainButtonVariant;
  icon?: React.ReactNode;
  rounded?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export interface MainIconButtonProps extends BaseButtonProps {
  size?: VariantProps<typeof StyledIconButton>['size'];
  variant?: IconButtonVariant;
}

export type ButtonProps<T> = MainButtonProps & T;
export type IconButtonProps<T> = MainIconButtonProps & T;
