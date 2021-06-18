import styled from '@emotion/styled';
import React from 'react';

interface CardWrapperProps {
  opaque?: boolean;
  depth?: 0 | 1 | 2 | 3;
}

export function isElementOfType<P = {}>(
  element: any,
  ComponentType: React.ComponentType<P>
): element is React.ReactElement<P> {
  return (
    element != null &&
    element.type != null &&
    element.type.displayName != null &&
    element.type.displayName === ComponentType.displayName
  );
}

export function isHeaderElement(
  child: any
): child is React.ReactElement<{ children: React.ReactNode }> {
  return isElementOfType(child, CardHeader);
}

const DEFAULT_TAG = 'div';

const CardWrapper = styled(DEFAULT_TAG)<CardWrapperProps>`
  // TODO reajust background color based on opacity. Needs new colors
  background: var(--maximeheckel-colors-foreground);
  backdrop-filter: ${(p) => (p.opaque ? '' : 'blur(6px)')};
  border-radius: var(--border-radius-2);
  box-shadow: ${(p) =>
    p.depth === 0 ? 'none' : `var(--maximeheckel-shadow-${p.depth || '1'})`};
`;

const CardHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: var(--border-radius-1);
  border-top-right-radius: var(--border-radius-1);
  min-height: 50px;
  padding: 0px 24px;
  color: var(--maximeheckel-colors-typeface-2);
  font-weight: 500;
  border-bottom: 1px solid var(--maximeheckel-colors-emphasis);
`;

const CardBody = styled('div')`
  padding: 36px 24px;
  position: relative;
  overflow: hidden;
`;

interface CardComposition {
  Header?: React.FC<{
    className?: string;
  }>;
  Body?: React.FC<{
    className?: string;
  }>;
}

interface CardProps extends CardWrapperProps {
  title?: string;
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * Group children based of a "comparator function" by displayName
 *
 *
 * @param {React.ReactNode | React.ReactNode[]} children
 * @param {(child: React.ReactNode) => boolean} comparator
 * @returns {Record<string, React.ReactNode[]>} An object where each key is a displayName, and the corresponding value an array of children with that
 * displayName that passed the comparator function. Children that are not passing the comparator function or invalid will land in the "rest" array.
 */
const groupBy = (
  children: React.ReactNode | React.ReactNode[],
  comparator: (child: React.ReactNode) => boolean
): Record<string, React.ReactNode[]> => {
  const result = React.Children.toArray(children).reduce(
    (output: Record<string, React.ReactNode[]>, child: React.ReactNode) => {
      // If the child has a displayName and the comparator function is truthy
      if (
        React.isValidElement(child) &&
        comparator(child) &&
        child.type.displayName !== null
      ) {
        if (output[child.type.displayName]) {
          output[child.type.displayName].push(child);
        } else {
          output[child.type.displayName] = [child];
        }
        // Else put the child in the "rest" array
      } else {
        if (output.rest) {
          output.rest.push(child);
        } else {
          output.rest = [child];
        }
      }

      return output;
    },
    {}
  ) as Record<string, React.ReactNode[]>;

  return result;
};

function Card<T>(props: CardProps & CardComposition & T) {
  const { as: Component, children, opaque, depth, title, ...rest } = props;

  const childrenGroup = groupBy(children, isHeaderElement);

  console.log(childrenGroup);

  let header =
    childrenGroup.CardHeader?.length > 0 ? childrenGroup.CardHeader[0] : null;

  /**
   * If title is specified and no CardHeader component has been found
   * render a CardHeader with that title as content
   */
  if (title && !header) {
    header = <CardHeader>{title}</CardHeader>;
  }

  return (
    <CardWrapper as={Component} depth={depth} opaque={opaque} {...rest}>
      {header}
      {childrenGroup.rest}
    </CardWrapper>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.displayName = 'Card';

export default Card;
