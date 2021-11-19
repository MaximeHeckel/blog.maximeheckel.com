import React from 'react';

import {
  StyledCallout,
  StyledCalloutIconWrapper,
  StyledCalloutLabelWrapper,
} from './Styles';
import { CalloutProps } from './types';
import { getVariantIcon } from './utils';

const Callout: React.FC<CalloutProps> = (props) => {
  const { children, label, variant, ...rest } = props;

  const icon = label ? null : getVariantIcon(variant);

  return (
    <StyledCallout data-variant={variant} {...rest}>
      {icon ? (
        <StyledCalloutIconWrapper data-variant={variant}>
          {icon}
        </StyledCalloutIconWrapper>
      ) : null}
      {label ? (
        <StyledCalloutLabelWrapper data-variant={variant}>
          {label}
        </StyledCalloutLabelWrapper>
      ) : null}
      {children}
    </StyledCallout>
  );
};

export default Callout;
