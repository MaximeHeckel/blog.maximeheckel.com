import React from 'react';

export interface CheckboxProps
  extends Omit<React.HTMLProps<HTMLInputElement>, 'label' | 'as' | 'type'> {
  label?: React.ReactNode;
  id: string;
  ['data-testid']?: string;
  ['aria-label']: string;
}
