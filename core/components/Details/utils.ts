import { isElementOfType } from 'lib/utils/isElementOfType';

import Summary from './DetailsSummary';

export function isElementOfTypeSummary(
  child: React.ReactNode
): child is React.ReactElement<{ children: React.ReactNode }> {
  return isElementOfType(child, Summary);
}
