import React from 'react';

export interface HeaderContextValue {
  collapsed: boolean;
  sticky: boolean;
}

export const HeaderContext = React.createContext<HeaderContextValue>({
  collapsed: false,
  sticky: false,
});
