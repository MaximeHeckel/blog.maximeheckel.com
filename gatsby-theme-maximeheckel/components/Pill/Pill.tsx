import React from 'react';
import styled from '@emotion/styled';

interface PillWrapperProps {
  color: string;
}

const PillWrapper = styled('span')<PillWrapperProps>`
  font-size: 14px;
  background: ${(p) => p.color};
  border-radius: var(--border-radius-1);
  height: 28px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  padding: 5px 8px 5px 8px !important;
  color: var(--maximeheckel-colors-brand);
  border: 1px solid var(--maximeheckel-colors-brand);
  min-width: 40px;
  font-weight: 500;
  cursor: default;
  user-select: none;
`;

interface Props extends PillWrapperProps {
  text: string;
}

const Pill: React.FC<Props> = (props) => {
  const { text, color } = props;
  return (
    <PillWrapper {...props} color={color}>
      {text}
    </PillWrapper>
  );
};

export { Pill };
