import React from 'react';

export interface RadioContextType {
  name: HTMLInputElement['name'];
  onChange: React.FormEventHandler<HTMLInputElement>;
}

export type RadioGroupOptions = {
  direction?: 'vertical' | 'horizontal';
};

export type RadioGroupProps = RadioContextType &
  RadioGroupOptions & {
    id?: string;
    ['data-testid']?: string;
  };

export interface RadioItemProps
  extends Omit<
    React.HTMLProps<HTMLInputElement>,
    'onChange' | 'label' | 'name' | 'as' | 'type'
  > {
  label?: React.ReactNode;
  id: string;
  ['aria-label']: string;
}
