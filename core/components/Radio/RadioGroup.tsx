import { Flex } from '@maximeheckel/design-system';
import React from 'react';
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
      alignItems={direction === 'vertical' ? 'flex-start' : 'center'}
      direction={direction === 'vertical' ? 'column' : 'row'}
      gap={2}
      role="radiogroup"
    >
      <RadioContext.Provider value={{ name, onChange }}>
        {filteredChildren}
      </RadioContext.Provider>
    </Flex>
  );
};

export default RadioGroup;
