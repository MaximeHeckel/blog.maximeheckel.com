import { Config } from './types';

export const defaultConfig: Config = {
  separator: '+',
  orSeparator: '|',
  preventDefault: false,
  eventType: 'keydown',
};

export const specialKeys = {
  CTRL: 'CTRL',
  SHIFT: 'SHIFT',
  ALT: 'ALT',
  META: 'META',
};
