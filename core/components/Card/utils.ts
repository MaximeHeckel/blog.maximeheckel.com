import React from 'react';
import { CardHeader } from './Styles';

// TODO: Lift this up the tree in standalone utils file
/**
 * Returns true if the element is of type P, returns false otherwise
 * @param {any} element
 * @param {React.ComponentType<P>} ComponentType
 * @returns {boolean}
 */
export function isElementOfType<P = {}>(
  element: unknown,
  ComponentType: React.ComponentType<P>
): element is React.ReactElement<P> {
  const reactElement = element as React.ReactElement;

  return (
    reactElement &&
    reactElement.type &&
    // @ts-ignore
    reactElement.type.displayName &&
    // @ts-ignore
    reactElement.type.displayName === ComponentType.displayName
  );
}

export function isHeaderElement(
  child: React.ReactNode
): child is React.ReactElement<{ children: React.ReactNode }> {
  return isElementOfType(child, CardHeader);
}
