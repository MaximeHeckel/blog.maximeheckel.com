import styled from '@emotion/styled';
import React from 'react';

const ColoredBlockWrapper = styled('div')`
  background: ${props => props.color};
  color: #2b2d3e;
  position: relative;
  width: 100vw;
  padding-bottom: 50px;
  padding-top: 50px;
  margin-bottom: 30px;
  left: calc(-50vw + 50%);

  div {
    @media (max-width: 800px) {
      padding-left: 30px;
      padding-right: 30px;
    }
    margin: 0 auto;
    max-width: 700px;
  }
`;

const ColoredBlock = props => {
  return (
    <ColoredBlockWrapper color={props.color}>
      <div>{props.children}</div>
    </ColoredBlockWrapper>
  );
};

export default ColoredBlock;
