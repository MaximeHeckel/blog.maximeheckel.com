import type { ComponentPropsWithRef, ElementType } from 'react';
import type { StyledComponent, SystemStyleObject } from 'styled-system/types';

type NumericVariant<Value> = Value extends `${infer NumberValue extends number}`
  ? Value | NumberValue
  : Value extends number
    ? Value | `${Value}`
    : Value;

type Variants<Props> = {
  [Key in keyof Props]: NumericVariant<Props[Key]>;
};

type PolymorphicComponent<
  Base extends ElementType,
  Props extends Record<string, unknown>,
> = {
  <As extends ElementType>(
    props: Omit<
      ComponentPropsWithRef<NoInfer<As>>,
      keyof Props | 'as' | 'css' | 'unstyled'
    > & {
      css?: SystemStyleObject | SystemStyleObject[];
      unstyled?: boolean;
    } & Props & { as: As }
  ): React.JSX.Element;
} & StyledComponent<Base, Props>;

// Keep the selected element's props and the blog's numeric variant shorthand.
export function withAs<
  Base extends ElementType,
  Props extends Record<string, unknown>,
>(
  component: StyledComponent<Base, Props>
): PolymorphicComponent<Base, Variants<Props>> {
  return component as PolymorphicComponent<Base, Variants<Props>>;
}
