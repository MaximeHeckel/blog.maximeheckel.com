import styled from '@emotion/styled';
import React from 'react';
import Grid from '../Grid';
import Logo from '../Logo';

const HR = styled.hr`
  height: 2px;
  background: hsl(var(--palette-gray-20));
`;

const FooterBlock = styled.div`
  background: var(--maximeheckel-colors-body);
  transition: 0.5s;
  height: 130px;
  width: 100%;
`;

const FooterWrapper = styled.div`
  padding-top: 30px;
  width: 100%;
  margin-top: 30px;
  grid-column: 2;
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
    <Grid columns="var(--layout-medium)" columnGap={20}>
      <FooterWrapper>
        <HR />

        <FooterContent>
          <div>© {new Date().getFullYear()} Maxime Heckel —— SF/NY</div>
          <Logo alt="Maxime Heckel's logo" size={40} />
        </FooterContent>
      </FooterWrapper>
    </Grid>
  </FooterBlock>
);

export { Footer };
