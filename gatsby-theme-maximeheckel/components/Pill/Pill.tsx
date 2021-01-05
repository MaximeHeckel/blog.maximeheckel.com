import React from 'react';
import styled from '@emotion/styled';

interface PillWrapperProps {
  color: string;
}

const PillWrapper = styled('span')<PillWrapperProps>`
  font-size: 14px;
  background: ${(p) => p.color};
  border-radius: var(--border-radius-1);
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px 5px 8px;
  margin-left: 8px;
  color: #2b2d3e;
  min-width: 40px;
`;

interface Props extends PillWrapperProps {
  text: string;
}

const Pill: React.FC<Props> = (props) => (
  <PillWrapper color={props.color}>{props.text}</PillWrapper>
);

export { Pill };
