export interface SwitchProps
  extends Omit<React.HTMLProps<HTMLInputElement>, 'checked' | 'label' | 'as'> {
  toggled?: boolean;
  label?: React.ReactNode;
  id: string;
  ['data-testid']?: string;
  ['aria-label']: string;
}
