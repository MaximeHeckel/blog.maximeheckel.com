export type TextInputTypes = 'email' | 'password' | 'search' | 'text' | 'url';

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: TextInputTypes;
  label?: React.ReactNode;
  value?: string;
  id: string;
  ['data-testid']?: string;
  ['aria-label']: string;
  onChange: React.FormEventHandler<HTMLInputElement>;
}
