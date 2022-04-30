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

  // @ts-ignore ts complains about displayName not existing on `type`
  return reactElement?.type?.displayName === ComponentType.displayName;
}
