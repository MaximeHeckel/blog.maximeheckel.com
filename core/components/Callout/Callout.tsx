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
    <StyledCallout variant={variant} {...rest}>
      {icon ? (
        <StyledCalloutIconWrapper variant={variant}>
          {icon}
        </StyledCalloutIconWrapper>
      ) : null}
      {label ? (
        <StyledCalloutLabelWrapper variant={variant}>
          {label}
        </StyledCalloutLabelWrapper>
      ) : null}
      {children}
    </StyledCallout>
  );
};

export default Callout;
