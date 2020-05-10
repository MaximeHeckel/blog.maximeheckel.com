import React from 'react';
import styled from '@emotion/styled';

const Matrix = () => (
  <svg
    width="878"
    height="402"
    viewBox="0 0 878 402"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.61902 242.59L876.479 238.357"
      stroke="#8A8A90"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.1 50"
    />
    <path
      d="M1.61902 321.513L876.479 317.28"
      stroke="#8A8A90"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.1 50"
    />
    <path
      d="M1.61902 400.436L876.479 396.202"
      stroke="#8A8A90"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.1 50"
    />
    <path
      d="M1.61902 5.82227L876.479 1.58895"
      stroke="#8A8A90"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.1 50"
    />
    <path
      d="M1.61902 84.7451L876.479 80.5118"
      stroke="#8A8A90"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.1 50"
    />
    <path
      d="M1.61902 163.667L876.479 159.434"
      stroke="#8A8A90"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.1 50"
    />
  </svg>
);

const LocalLogo = () => (
  <svg
    width="50"
    height="50"
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

const Wrapper = styled('div')`
  width: 1200px;
  height: 630px;
  position: relative;
  color: white;
  background: linear-gradient(90deg, #5284f9 -48.68%, #1b1e21 70.39%), #1b1e21;
  font-family: 'Helvetica', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;

  & > svg {
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

const TitleWrapper = styled('div')`
  margin-top: 110px;
  width: 730px;
  h1 {
    min-height: 95px;
    max-height: 95px;
    font-weight: 500;
    font-size: 47px;
    line-height: 60px;
  }
`;

const InfoWrapper = styled('div')`
  margin-top: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  p {
    font-weight: 500;
    font-size: 24px;
    line-height: 28px;
  }
`;

const PrinterComponent = ({ title }) => (
  <Wrapper>
    <Matrix />
    <TitleWrapper>
      <h1>{title}</h1>
      <InfoWrapper>
        <LocalLogo />
        <p>@MaximeHeckel</p>
      </InfoWrapper>
    </TitleWrapper>
  </Wrapper>
);

export default PrinterComponent;
