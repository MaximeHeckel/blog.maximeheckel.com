import React from 'react';
import { StyledBlockquote } from './Styles';

const Blockquote: React.FC = (props) => {
  const { children, ...rest } = props;

  return (
    <StyledBlockquote {...rest}>
      <div>{children}</div>
    </StyledBlockquote>
  );
};

export default Blockquote;
