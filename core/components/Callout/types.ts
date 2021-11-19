export type CalloutVariant = 'info' | 'danger';

export interface CalloutProps {
  label?: React.ReactNode | string;
  variant: CalloutVariant;
}
