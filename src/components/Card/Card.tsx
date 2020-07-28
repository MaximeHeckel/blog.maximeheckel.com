import React from 'react';
import styled from 'gatsby-theme-maximeheckel/src/utils/styled';

const CardWrapper = styled('div')`
  background: linear-gradient(301.9deg, #fef8fd -5.6%, #e4eeff 93.18%);
  width: 100%;
  max-width: 800px;
  margin-bottom: 25px;
  border-radius: 4px;
  padding: 30px;
  color: ${p => p.theme.colors.black};
`;

const CardTitle = styled('h2')`
  margin-top: 25px !important;
`;

interface CardProps {
  title?: string;
}

const Card: React.FC<CardProps> = props => {
  const { children, title } = props;
  return (
    <CardWrapper>
      {title ? <CardTitle>{title}</CardTitle> : null}
      {children}
    </CardWrapper>
  );
};

export { Card };
