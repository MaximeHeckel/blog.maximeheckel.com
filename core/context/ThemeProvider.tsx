import React from 'react';
import { ThemeProvider } from './ThemeContext';

const RootWrapper: React.FC = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

export default RootWrapper;
