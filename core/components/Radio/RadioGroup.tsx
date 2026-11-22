import React from 'react';

import Flex from '../Flex';
import { RadioGroupProps } from './Radio.types';
import { RadioContext } from './RadioContext';
import { isRadioItemElement } from './utils';

const RadioGroup = (props: RadioGroupProps) => {
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
