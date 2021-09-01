export type TextInputTypes = 'email' | 'password' | 'search' | 'text' | 'url';

export interface TextInputProps
  extends Omit<React.HTMLProps<HTMLInputElement>, 'label' | 'as'> {
  type?: TextInputTypes;
  label?: React.ReactNode;
  value?: string;
  id: string;
  ['data-testid']?: string;
  ['aria-label']: string;
  onChange: React.FormEventHandler<HTMLInputElement>;
}
