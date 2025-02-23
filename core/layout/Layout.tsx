import { styled } from '@maximeheckel/design-system';
import React from 'react';

import Footer from '@core/components/Footer';
import Header, { HeaderProps } from '@core/components/Header';

const Wrapper = styled('main', {
  background: 'var(--background)',
  transition: '0.3s',

  /**
   * Disable outline when user doesn't use keyboard
   */
  '&:focus:not(:focus-visible)': {
    outline: 0,
  },

  /**
   * Custom outline
   */
  '&:focus-visible': {
    outline: '2px solid var(--accent)',
    backgroundColor: 'var(--foreground)',
  },
});

interface LayoutProps {
  footer?: boolean;
  header?: boolean;
  headerProps?: HeaderProps;
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children, header, footer, headerProps } = props;

  return (
    <Wrapper>
      {header ? <Header {...headerProps} /> : null}
      {children}
      {footer ? <Footer /> : null}
    </Wrapper>
  );
};

export default Layout;
