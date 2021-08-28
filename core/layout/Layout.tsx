import styled from '@emotion/styled';
import React from 'react';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { MainHeaderProps } from '../components/Header/types';
import Header from '../components/Header';

const Wrapper = styled.main`
  background: var(--maximeheckel-colors-body);
  transition: 0.5s;

  /**
   * Disable outline when user doesn't use keyboard 
   */
  &:focus:not(:focus-visible) {
    outline: 0;
  }

  /**
   * Custom outline 
   */
  &:focus-visible {
    outline: 2px solid var(--maximeheckel-colors-brand);
    background-color: var(--maximeheckel-colors-foreground);
  }
`;

interface LayoutProps {
  footer?: boolean;
  header?: boolean;
  headerProps?: MainHeaderProps;
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { children, header, footer, headerProps } = props;
  const theme = useTheme();

  return (
    <Wrapper data-theme={theme.dark ? 'dark' : 'light'}>
      {header ? <Header themeSwitcher={true} {...headerProps} /> : null}
      {children}
      {footer ? <Footer /> : null}
    </Wrapper>
  );
};

export default Layout;
