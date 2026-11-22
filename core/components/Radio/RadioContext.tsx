import { createContext } from 'react';

import { RadioContextType } from './Radio.types';

export const RadioContext = createContext<RadioContextType | undefined>(
  undefined
);
