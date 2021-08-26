import { isElementOfType } from '../utils/isElementOfType';
import RadioItem from './RadioItem';

export function isRadioItemElement(
  child: React.ReactNode
): child is React.ReactElement<{ children: React.ReactNode }> {
  return isElementOfType(child, RadioItem);
}
