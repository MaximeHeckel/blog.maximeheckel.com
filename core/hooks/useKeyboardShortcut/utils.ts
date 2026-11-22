import { specialKeys } from './constants';
import { Config } from './types';

export const extractRegularKeys = (
  string: string,
  config: Config
): string[] => {
  return string
    .replace(/ /g, '')
    .split(config.separator as string)
    .filter((o) => !Object.values(specialKeys).includes(o));
};
