import React from 'react';
import { CardBody, CardHeader, CardWrapper } from './Styles';
import { CardComposition, CardProps } from './types';
import { isHeaderElement } from './utils';

function Card<T>(props: CardProps & CardComposition & T) {
  const { as: Component, children, glass, depth, title, ...rest } = props;

  const hasHeaderChildren = React.Children.toArray(children).some((child) =>
    isHeaderElement(child)
  );

  let header = null;

  /**
   * If no CardHeader children are present AND if a title has been specified as a prop
   * create an instance of CardHeader with the title prop
   */
  if (!hasHeaderChildren && title) {
    header = <CardHeader>{title}</CardHeader>;
  }

  return (
    <CardWrapper as={Component} depth={depth} glass={glass} {...rest}>
      {header}
      {children}
    </CardWrapper>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.displayName = 'Card';

export default Card;
