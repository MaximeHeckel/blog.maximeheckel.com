import type { SystemStyleObject as CSS } from 'styled-system/types';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant: 'info' | 'danger' | 'success' | 'warning';
  css?: CSS;
}
