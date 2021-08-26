import React from 'react';
import Flex from '../Flex';
import { RadioContext } from './RadioContext';
import { RadioGroupProps } from './types';
import { isRadioItemElement } from './utils';

const RadioGroup: React.FC<RadioGroupProps> = (props) => {
  const { children, direction = 'vertical', name, onChange } = props;

  const filteredChildren = React.Children.toArray(children).filter((child) =>
    isRadioItemElement(child)
  );

  return (
    <Flex
      gap={8}
      alignItems={direction === 'vertical' ? 'flex-start' : 'center'}
      direction={direction === 'vertical' ? 'column' : 'row'}
      role="radiogroup"
    >
      <RadioContext.Provider value={{ name, onChange }}>
        {filteredChildren}
      </RadioContext.Provider>
    </Flex>
  );
};

export default RadioGroup;
