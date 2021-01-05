import React from 'react';
import styled from '@emotion/styled';

const CardWrapper = styled('div')`
  background: linear-gradient(301.9deg, #fef8fd -5.6%, #e4eeff 93.18%);
  width: 100%;
  max-width: 800px;
  margin-bottom: 25px;
  border-radius: var(--border-radius-2);
  padding: 30px;
  color: hsla(var(--palette-gray-95), 100%);
  box-shadow: var(--maximeheckel-shadow-2);

  h1,
  h2,
  h3,
  h4,
  p,
  strong {
    color: hsla(var(--palette-gray-95), 100%) !important;
  }
`;

const CardTitle = styled('h3')`
  margin-top: 25px !important;
`;

interface CardProps {
  title?: string;
}

const Card: React.FC<CardProps> = (props) => {
  const { children, title } = props;
  return (
    <CardWrapper>
      {title ? <CardTitle>{title}</CardTitle> : null}
      {children}
    </CardWrapper>
  );
};

export { Card };
