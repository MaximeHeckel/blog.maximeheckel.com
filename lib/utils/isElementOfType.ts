import { ReactNode, isValidElement } from 'react';

/**
 * Returns true if the element is of type P, returns false otherwise
 * @param {any} element
 * @param {React.ComponentType<P>} ComponentType
 * @returns {boolean}
 */
export function isElementOfType<P = object>(
  element: ReactNode,
  ComponentType: React.ComponentType<P>
): element is React.ReactElement<P> {
  if (!isValidElement(element)) {
    return false;
  }

  const reactElement = element as React.ReactElement;

  if (typeof reactElement.type === 'string') {
    return false;
  }

  if (reactElement.type && 'displayName' in reactElement.type) {
    return reactElement.type.displayName === ComponentType.displayName;
  }

  return false;
}
