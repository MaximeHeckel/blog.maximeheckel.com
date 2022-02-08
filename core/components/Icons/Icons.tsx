import { StyledSVG } from './StyledIcons';
import { IconProps } from './types';

export const TwitterIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 25 24"
    stroke="currentColor"
    strokeWidth="2"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Twitter</title>
    <desc id="desc">The outline of a blue bird, the logo of twitter.com</desc>
    <path
      d="M23.8618 2.9995C22.9042 3.67497 21.8439 4.19161 20.7218 4.5295C20.1196 3.83701 19.3192 3.34619 18.4289 3.12342C17.5386 2.90066 16.6013 2.95669 15.7439 3.28395C14.8865 3.61121 14.1503 4.1939 13.6348 4.95321C13.1193 5.71253 12.8495 6.61183 12.8618 7.5295V8.5295C11.1044 8.57506 9.36309 8.18531 7.79283 7.39494C6.22256 6.60458 4.87213 5.43813 3.86182 3.9995C3.86182 3.9995 -0.138184 12.9995 8.86182 16.9995C6.80234 18.3975 4.34897 19.0984 1.86182 18.9995C10.8618 23.9995 21.7818 18.8949 21.7818 7.39494C21.7809 7.1164 21.8341 6.94309 21.7818 6.6695C22.8024 5.66299 23.5226 4.39221 23.8618 2.9995Z"
      role="presentation"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);

export const GithubIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Github</title>
    <desc id="desc">The outline of an Octocat, the logo of github.com</desc>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </StyledSVG>
);

export const ArrowIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Arrow</title>
    <desc id="desc">An icon representing an arrow</desc>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </StyledSVG>
);

export const ExternalIcon = (props: IconProps) => (
  <StyledSVG
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">External Arrow</title>
    <desc id="desc">
      An icon representing an arrow pointing diagonally towards the top right
      corner of the screen
    </desc>
    <path
      d="M7.73242 17.4224L17.7324 7.42236"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.73242 7.42236H17.7324V17.4224"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);

export const EnterIcon = (props: IconProps) => (
  <StyledSVG
    width="22"
    height="22"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Enter Arrow</title>
    <desc id="desc">
      An icon representing an a twisted arrow like the one used on the enter key
      for most keyboard
    </desc>
    <path
      d="M9.08862 10.6855L4.08862 15.6855L9.08862 20.6855"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.0886 4.68555V11.6855C20.0886 12.7464 19.6672 13.7638 18.917 14.514C18.1669 15.2641 17.1495 15.6855 16.0886 15.6855H4.08862"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);

export const MapIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    stroke="currentColor"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Map</title>
    <desc id="desc">An icon representing an unfolded paper map</desc>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </StyledSVG>
);

export const RSSIcon = (props: IconProps) => (
  <StyledSVG
    width="22"
    height="22"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">RSS</title>
    <desc id="desc">
      An icon representing the RSS symbol: a dot followed by 2 circle arcs
    </desc>
    <path
      d="M4.36719 11C6.75414 11 9.04332 11.9482 10.7311 13.636C12.419 15.3239 13.3672 17.6131 13.3672 20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.36719 4C8.61065 4 12.6803 5.68571 15.6809 8.68629C18.6815 11.6869 20.3672 15.7565 20.3672 20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.36719 20C5.91947 20 6.36719 19.5523 6.36719 19C6.36719 18.4477 5.91947 18 5.36719 18C4.8149 18 4.36719 18.4477 4.36719 19C4.36719 19.5523 4.8149 20 5.36719 20Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);

export const ContactIcon = (props: IconProps) => (
  <StyledSVG
    width="22"
    height="22"
    viewBox="0 0 25 25"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Contact</title>
    <desc id="desc">
      An icon representing a letter in the shape of a paper plane
    </desc>
    <path
      d="M22.4355 2.73096L11.4355 13.731"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.4355 2.73096L15.4355 22.731L11.4355 13.731L2.43555 9.73096L22.4355 2.73096Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);

export const PortfolioIcon = (props: IconProps) => (
  <StyledSVG
    width="22"
    height="22"
    viewBox="0 0 25 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Portfolio</title>
    <desc id="desc">An icon representing a folder</desc>
    <path
      d="M22.4355 18.9995C22.4355 19.5299 22.2248 20.0387 21.8498 20.4137C21.4747 20.7888 20.966 20.9995 20.4355 20.9995H4.43555C3.90511 20.9995 3.39641 20.7888 3.02133 20.4137C2.64626 20.0387 2.43555 19.5299 2.43555 18.9995V4.99951C2.43555 4.46908 2.64626 3.96037 3.02133 3.5853C3.39641 3.21023 3.90511 2.99951 4.43555 2.99951H9.43555L11.4355 5.99951H20.4355C20.966 5.99951 21.4747 6.21023 21.8498 6.5853C22.2248 6.96037 22.4355 7.46908 22.4355 7.99951V18.9995Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);

export const PlayIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Play</title>
    <desc id="desc">
      An icon representing the play symbol, a triangle pointing to the right
    </desc>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </StyledSVG>
);

export const PauseIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Pause</title>
    <desc id="desc">
      An icon representing the pause symbol, 2 vertical bars
    </desc>
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </StyledSVG>
);

export const RepeatIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Repeat</title>
    <desc id="desc">
      An icon representing an arrow twisted so it makes a loop
    </desc>
    <polyline points="17 1 21 5 17 9"></polyline>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <polyline points="7 23 3 19 7 15"></polyline>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
  </StyledSVG>
);

export const InfoIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Info</title>
    <desc id="desc">
      An icon representing the letter &lsquo;i&lsquo; in a circle
    </desc>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </StyledSVG>
);

export const AlertIcon = (props: IconProps) => (
  <StyledSVG
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Alert</title>
    <desc id="desc">
      An icon representing an exclamation mark in an octogone
    </desc>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </StyledSVG>
);

export const StackIcon = (props: IconProps) => (
  <StyledSVG
    width="24"
    height="24"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby="title  desc"
    {...props}
  >
    <title id="title">Stack</title>
    <desc id="desc">An icon representing 3 tiles on top of each other</desc>
    <path d="M12.0645 2.92166L2.06452 7.92166L12.0645 12.9217L22.0645 7.92166L12.0645 2.92166Z" />
    <path d="M2.06452 17.9217L12.0645 22.9217L22.0645 17.9217" />
    <path d="M2.06452 12.9217L12.0645 17.9217L22.0645 12.9217" />
  </StyledSVG>
);
