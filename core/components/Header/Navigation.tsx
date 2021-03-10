import React from 'react';
import { HeaderContext } from './Context';
import styled from '@emotion/styled';

export interface HeaderNavigationProps {}

export const StyledHeaderNav = styled('div')<{ hide: boolean }>`
  @media (max-width: 700px) {
    display: ${(p) => (p.hide ? 'none' : 'block')}!important;
  }

  margin: 0 20px;
`;

export const Navigation: React.FC<HeaderNavigationProps> = (props) => {
  const { collapsed, sticky } = React.useContext(HeaderContext);
  return (
    <StyledHeaderNav hide={collapsed && sticky}>
      {props.children}
    </StyledHeaderNav>
  );
};
