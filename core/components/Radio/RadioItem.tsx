import React from 'react';
import Flex from '../Flex';
import Label from '../Label';
import { RadioContext } from './RadioContext';
import { StyledRadio } from './Styles';
import { RadioItemProps } from './types';

const RadioItem = (props: RadioItemProps) => {
  const { id, checked, label, ...rest } = props;
  const radioContext = React.useContext(RadioContext);

  if (!radioContext) {
    // eslint-disable-next-line no-console
    console.warn('Radio.Item must be rendered within a Radio.Group component!');
    return null;
  }

  const { name, onChange } = radioContext;

  return (
    <Flex css={{ gap: '8px' }}>
      <StyledRadio
        role="radio"
        id={id}
        type="radio"
        name={name}
        checked={checked}
        aria-checked={checked}
        onChange={(event) => onChange(event)}
        {...rest}
      />
      <Label htmlFor={id}>{label}</Label>
    </Flex>
  );
};

RadioItem.displayName = 'RadioItem';

export default RadioItem;
