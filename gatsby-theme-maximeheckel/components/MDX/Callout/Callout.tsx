import React from 'react';
import styled from '@emotion/styled';

export enum VARIANT {
  DANGER = 'danger',
  INFO = 'info',
}

interface Props {
  variant: VARIANT;
}

const Callout: React.FC<Props> = (props) => (
  <StyledCallout {...props}>{props.children}</StyledCallout>
);

const variantColors = {
  [VARIANT.DANGER]: `
    background-color: var(--maximeheckel-colors-danger-emphasis);
    border-color: var(--maximeheckel-colors-danger);
    color: var(--maximeheckel-colors-typeface-0);
    `,
  [VARIANT.INFO]: `
    background-color: var(--maximeheckel-colors-emphasis);
    border-color: var(--maximeheckel-colors-brand);
    color: var(--maximeheckel-colors-typeface-0);
  `,
};

const StyledCallout = styled('div')<{ variant: VARIANT }>`
  @media (max-width: 600px) {
    position: relative;
    width: 100vw;
    left: calc(-50vw + 50%);
    border-radius: 0px;
  }

  border-radius: 4px var(--border-radius-2) var(--border-radius-2) 4px;
  border-left: 3px solid;
  padding: 30px 30px;
  margin-bottom: 25px;

  *:last-child {
    margin-bottom: 0px;
  }

  ${(p) => variantColors[p.variant]}
`;

export { Callout };
