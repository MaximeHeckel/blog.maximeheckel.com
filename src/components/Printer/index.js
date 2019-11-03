import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled('div')`
  background: #ffffff;
  padding: 50px;
  width: 800px;
  height: 400px;
  color: #2b2d3e;
  font-family: -apple-system, 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Content = styled('div')`
  display: flex;
  align-items: center;
  height: 200px;

  svg {
    max-width: 90px;
    min-width: 90px;
  }
`;

const Title = styled('h1')`
  margin-left: 20px;
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: 38px;
  font-weight: 500;
  line-height: 1.5;
`;

const Footer = styled('div')`
  display: flex;
  justify-content: flex-end;
  padding-right: 50px;
`;

const LocalLogo = () => (
  <svg
    width="401"
    height="401"
    viewBox="0 0 401 401"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <circle cx="200.633" cy="200.58" r="200" fill="#2B2D3E" />
      <rect
        x="131.283"
        y="104.174"
        width="46.5558"
        height="144.938"
        rx="23.2779"
        transform="rotate(26 131.283 104.174)"
        fill="#FFFFFF"
      />
      <rect
        x="231.663"
        y="109.137"
        width="46.5558"
        height="144.938"
        rx="23.2779"
        transform="rotate(26 231.663 109.137)"
        fill="#FFFFFF"
      />
      <rect
        x="257.779"
        y="207.753"
        width="46.5558"
        height="68.1965"
        rx="23.2779"
        transform="rotate(-30 257.779 207.753)"
        fill="#FFFFFF"
      />
    </g>
  </svg>
);

const PrinterComponent = ({ title }) => (
  <Wrapper>
    <Content>
      <LocalLogo />
      <Title>{title}</Title>
    </Content>
    <Footer>
      <h3 style={{ color: '#196FD8' }}>@MaximeHeckel</h3>
    </Footer>
  </Wrapper>
);

export default PrinterComponent;
