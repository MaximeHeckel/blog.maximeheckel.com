import styled from '@emotion/styled';
import dynamic from 'next/dynamic';
import React from 'react';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { MainHeaderProps } from '../components/Header/types';

const MainHeader = dynamic(() => import('../components/Header'));
interface LayoutProps {
  footer?: boolean;
  header?: boolean;
  headerProps?: MainHeaderProps;
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { header, footer, headerProps, ...rest } = props;
  const theme = useTheme();

  return (
    <Wrapper
      tabIndex={-1}
      data-testid={theme.dark ? 'darkmode' : 'lightmode'}
      {...rest}
    >
      {header ? <MainHeader themeSwitcher={true} {...headerProps} /> : null}
      <Content>{props.children}</Content>
      {footer ? <Footer /> : null}
    </Wrapper>
  );
};

export { Layout };

const Wrapper = styled.div`
  transition: 0.5s;
  background: var(--maximeheckel-colors-body);

  &:focus:not(:focus-visible) {
    outline: 0;
  }

  &:focus-visible {
    outline: 2px solid var(--maximeheckel-colors-brand);
    background-color: var(--maximeheckel-colors-foreground);
  }
`;

const Content = styled.div`
  @media (max-width: 700px) {
    padding: 0px 20px 0px 20px;
  }
  margin: 0 auto;
  max-width: 1020px;
  padding: 0px 70px 0px 70px;
  color: var(--maximeheckel-colors-typeface-0);
`;
