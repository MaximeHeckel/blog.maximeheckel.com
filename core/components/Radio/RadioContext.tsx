import { createContext } from 'react';
import { RadioContextType } from './types';

export const RadioContext = createContext<RadioContextType | undefined>(
  undefined
);
