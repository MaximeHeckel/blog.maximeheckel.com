export type ResizeProperty = 'none' | 'vertical' | 'horizontal';

export interface StyledTextAreaProps {
  resize?: ResizeProperty;
  readOnly?: boolean;
}

export interface TextAreaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'label' | 'as' | 'value'
  > {
  label?: React.ReactNode;
  value?: string;
  id: string;
  ['data-testid']?: string;
  ['aria-label']: string;
  onChange: React.FormEventHandler<HTMLTextAreaElement>;
  resize?: ResizeProperty;
}
