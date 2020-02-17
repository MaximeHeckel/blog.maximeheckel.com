import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled('div')`
  width: 800px;
  height: 400px;
  color: #2b2d3e;
  font-family: 'Helvetica', sans-serif;
  display: flex;
  background: #fff;
  svg {
    max-width: 200px;
    min-width: 200px;
  }
`;

const Title = styled('h1')`
  padding-left: 20px;
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 38px;
  font-weight: 500;
  line-height: 1.5;
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
      <circle cx="200.633" cy="200.58" r="200" fill="none" />
      <rect
        x="131.283"
        y="104.174"
        width="46.5558"
        height="144.938"
        rx="23.2779"
        transform="rotate(26 131.283 104.174)"
        fill="#fff"
      />
      <rect
        x="231.663"
        y="109.137"
        width="46.5558"
        height="144.938"
        rx="23.2779"
        transform="rotate(26 231.663 109.137)"
        fill="#fff"
      />
      <rect
        x="257.779"
        y="207.753"
        width="46.5558"
        height="68.1965"
        rx="23.2779"
        transform="rotate(-30 257.779 207.753)"
        fill="#fff"
      />
    </g>
  </svg>
);

const PrinterComponent = ({ title }) => (
  <Wrapper>
    <div
      style={{ backgroundColor: '#2b2d3e', maxWidth: '250px', height: '100%' }}
    >
      <LocalLogo />
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Title>{title}</Title>
      <h3 style={{ color: '#196FD8', paddingLeft: '20px' }}>@MaximeHeckel</h3>
    </div>
  </Wrapper>
);

export default PrinterComponent;
