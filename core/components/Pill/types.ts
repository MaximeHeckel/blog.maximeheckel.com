export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant: 'info' | 'danger' | 'success' | 'warning';
}
