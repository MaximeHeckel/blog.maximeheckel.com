import { ForwardRefComponent, HTMLMotionProps } from 'framer-motion';

export type MainButtonVariant = 'primary' | 'secondary';
export type IconButtonVariant = 'icon';

interface BaseButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  as?: ForwardRefComponent<HTMLButtonElement, HTMLMotionProps<'button'>>;
  type?: 'button' | 'reset' | 'submit';
}

interface MainButtonProps extends BaseButtonProps {
  variant: MainButtonVariant;
  icon?: never;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

interface IconButtonProps extends BaseButtonProps {
  variant: IconButtonVariant;
  icon: React.ReactNode | HTMLOrSVGElement;
  startIcon?: never;
  endIcon?: never;
}

export type ButtonProps<T> = (MainButtonProps | IconButtonProps) & T;
