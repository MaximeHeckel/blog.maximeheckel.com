import React from 'react';
import styled from '@emotion/styled';

export enum VARIANT {
  DANGER = 'danger',
  INFO = 'info',
}

interface Props {
  variant: VARIANT;
}

const Callout: React.FC<Props> = (props) => <StyledCallout {...props} />;

const variantColors = {
  [VARIANT.DANGER]: `
    background-color: var(--maximeheckel-colors-danger-emphasis);
    border-color: var(--maximeheckel-colors-danger);
    color: var(--maximeheckel-colors-typeface-primary);
    `,
  [VARIANT.INFO]: `
    background-color: var(--maximeheckel-colors-emphasis);
    border-color: var(--maximeheckel-colors-brand);
    color: var(--maximeheckel-colors-typeface-primary);
  `,
};

const StyledCallout = styled('div')<{ variant: VARIANT }>`
  @media (max-width: 700px) {
    /**
     * Make it fullbleed! 
     */
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;

    border-radius: 0px;
  }

  code {
    background: none;
  }

  border-radius: var(--border-radius-0);
  border-left: 3px solid;
  padding: 30px 30px;
  margin-bottom: 2.25rem;

  *:last-child {
    margin-bottom: 0px;
  }

  ${(p) => variantColors[p.variant]}
`;

export { Callout };
