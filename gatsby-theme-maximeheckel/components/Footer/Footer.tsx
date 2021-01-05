import styled from '@emotion/styled';
import React from 'react';
import Logo from '../Logo';

const HR = styled.hr`
  height: 2px;
  background: var(--maximeheckel-colors-typeface-0);
`;

const FooterBlock = styled.div`
  background: var(--maximeheckel-colors-body);
  transition: 0.5s;
  height: 130px;
  width: 100%;
`;

const FooterWrapper = styled.div`
  @media (max-width: 700px) {
    padding-left: 20px;
    padding-right: 20px;
  }

  padding-top: 30px;
  padding-left: 70px;
  padding-right: 70px;
  max-width: 1020px;
  margin-top: 30px;
  color: var(--maximeheckel-colors-typeface-0);
  font-size: 14px;
  margin: 0 auto;
  a {
    color: inherit;
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Footer: React.FC<{}> = () => (
  <FooterBlock data-testid="footer">
    <FooterWrapper>
      <HR />
      <FooterContent>
        <div>© {new Date().getFullYear()} Maxime Heckel —— SF/NY</div>
        <Logo alt="Maxime Heckel's logo" size={40} />
      </FooterContent>
    </FooterWrapper>
  </FooterBlock>
);

export { Footer };
