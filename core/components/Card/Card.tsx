import React from 'react';
import { CardBody, CardHeader, CardWrapper } from './Styles';
import { CardComposition, CardProps } from './types';
import { isHeaderElement } from './utils';

function Card<T>(props: CardProps & CardComposition & T) {
  const { as: Component, children, glass, depth, title, ...rest } = props;

  const hasHeaderChildren = React.Children.toArray(children).some((child) =>
    isHeaderElement(child)
  );

  return (
    <CardWrapper as={Component} depth={depth} glass={glass} {...rest}>
      {hasHeaderChildren || !title ? null : <CardHeader>{title}</CardHeader>}
      {children}
    </CardWrapper>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.displayName = 'Card';

export default Card;
