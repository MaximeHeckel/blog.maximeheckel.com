import React from 'react';
import { StyledBlockquote } from './Styles';

const Blockquote: React.FC = (props) => {
  const { children, ...rest } = props;

  return (
    <StyledBlockquote {...rest}>
      <p>{children}</p>
    </StyledBlockquote>
  );
};

export default Blockquote;
