import styled from '@emotion/styled';
import React from 'react';

const StyledBlockquote = styled('blockquote')`
  transition: 0.5s;
  margin: 30px 0px;
  color: var(--maximeheckel-colors-typeface-primary);
  font-style: italic;

  /**
   * Make it fullbleed! 
   */
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  padding-top: 40px;
  padding-bottom: 40px;
  background: var(--maximeheckel-colors-emphasis);
  backdrop-filter: blur(6px);
  & > p {
    max-width: 880px !important;
    padding-left: 50px;
    padding-bottom: 0;
    width: 100%;
    margin: 0 auto;
    font-size: 27px;
    line-height: 1.6818;
    font-weight: 400;
  }
`;

const Blockquote: React.FC = (props) => <StyledBlockquote {...props} />;

export { Blockquote };
