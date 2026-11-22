import type { ComponentPropsWithRef, ReactNode } from 'react';
import { styled } from 'styled-system/jsx';

import { buttonRecipe } from '../Button/Button.recipe';
import Flex from '../Flex';

const ButtonFrame = styled('button', {
  ...buttonRecipe,
  base: {
    ...buttonRecipe.base,
    // The reset layer supplies the inherited font before the size and weight.
    font: undefined,
  },
});

// Match the unlayered Icon styles until its size variants move to Panda.
const iconSize = buttonRecipe.base['& svg'];

interface ButtonProps extends ComponentPropsWithRef<typeof ButtonFrame> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const PilotButton = ({
  variant = 'primary',
  startIcon,
  endIcon,
  children,
  ...props
}: ButtonProps) => (
  <ButtonFrame
    hasIcon={startIcon ? 'startIcon' : endIcon ? 'endIcon' : 'none'}
    variant={variant}
    {...props}
  >
    {startIcon ? (
      <Flex css={{ marginRight: 'var(--space-1)', '& svg': iconSize }}>
        {startIcon}
      </Flex>
    ) : null}
    {children}
    {endIcon ? (
      <Flex css={{ marginLeft: 'var(--space-1)', '& svg': iconSize }}>
        {endIcon}
      </Flex>
    ) : null}
  </ButtonFrame>
);
