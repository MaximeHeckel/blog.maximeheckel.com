import { CSS } from 'lib/stitches.config';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant: 'info' | 'danger' | 'success' | 'warning';
  css?: CSS;
}
