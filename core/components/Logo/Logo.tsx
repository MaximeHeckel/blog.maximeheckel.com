import { css } from '@maximeheckel/design-system';

import { LogoProps } from './types';

const transitionLogo = css({
  transition: '0.5s',
  willChange: 'stroke, fill',
});

const Logo = ({
  alt = "Maxime Heckel's logo",
  size = 44,
  stroke = 'var(--text-primary)',
}: LogoProps) => (
  <svg
    aria-label={alt}
    role="img"
    className={transitionLogo()}
    width={size}
    height={(size * 28) / 33}
    viewBox="4 8 33 28"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <path
      d="M26.1797 11.1465C27.8664 9.60647 29.9197 9.16647 31.8997 10.1198C34.6864 11.4398 35.5664 14.6665 34.0264 17.3798L27.9837 27.8364"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={stroke}
    />
    <path
      d="M23.6169 33.6788C21.8919 34.3912 19.6379 34.0322 17.8926 32.4863"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={stroke}
    />
    <path
      d="M21.5816 20.724L14.813 31.8267C13.1996 34.6134 10.1196 35.42 8.06634 33.5134C5.49965 31.9734 4.83965 29.1134 6.453 26.3267L14.153 12.98C15.5463 10.56 17.673 9.38667 19.653 9.97336C22.733 10.8534 24.8596 13.3467 24.8596 16.5V28.9667C24.8596 32.0467 27.2063 34.54 30.1396 34.54C33.073 34.54 35.4196 32.0467 35.4196 28.9667V21.4867"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={stroke}
    />
  </svg>
);

export default Logo;
