import React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  id: string;
  ['data-testid']?: string;
  ['aria-label']: string;
}
