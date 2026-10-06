import { CSS, Flex, Icon } from '@maximeheckel/design-system';
import { ReactNode } from 'react';

import {
  StyledCallout,
  StyledCalloutHeader,
  StyledCalloutIconWrapper,
} from './Callout.styles';

export type CalloutVariant = 'info' | 'danger' | 'warning';

export interface CalloutProps {
  children: ReactNode;
  label?: ReactNode;
  variant: CalloutVariant;
  css?: CSS;
}

const getVariantIcon = (variant: CalloutVariant) => {
  switch (variant) {
    case 'info':
      return <Icon.Info size={3} />;
    case 'danger':
    case 'warning':
      return <Icon.Alert size={3} />;
  }
};

const variantLabels: Record<CalloutVariant, string> = {
  info: 'Note',
  danger: 'Caution',
  warning: 'Warning',
};

const Callout = (props: CalloutProps) => {
  const { children, label, variant, ...rest } = props;

  return (
    <StyledCallout
      variant={variant}
      css={{
        marginTop: 'var(--space-3)',
      }}
      {...rest}
    >
      <StyledCalloutHeader>
        <StyledCalloutIconWrapper aria-hidden="true">
          {getVariantIcon(variant)}
        </StyledCalloutIconWrapper>
        {label || variantLabels[variant]}
      </StyledCalloutHeader>
      <Flex alignItems="start" direction="column" gap="6">
        {children}
      </Flex>
    </StyledCallout>
  );
};

export default Callout;
