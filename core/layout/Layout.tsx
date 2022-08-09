import React from 'react';
import Footer from '@theme/components/Footer';
import Header, { HeaderProps } from '@theme/components/Header';
import { styled } from '@maximeheckel/design-system';

const Wrapper = styled('main', {
  background: 'var(--maximeheckel-colors-body)',
  transition: '0.5s',

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
    outline: '2px solid var(--maximeheckel-colors-brand)',
    backgroundColor: 'var(--maximeheckel-colors-foreground)',
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
