import { createContext } from 'react';

// BlogPost's 663px article column has two 16px grid gaps on narrow screens.
export const ImageSizesContext = createContext(
  'min(663px, calc(100vw - 32px))'
);
