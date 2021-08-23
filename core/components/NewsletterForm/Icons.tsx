import { css } from '@emotion/react';

export const NewsletterHeader = () => (
  <div
    css={css`
      > svg {
        position: absolute;
        width: 100%;
        top: -30px;

        @media (max-width: 700px) {
          > svg {
            left: -50%;
            width: 200%;
          }
        }
      }
    `}
  >
    <svg
      width="100%"
      height="218"
      viewBox="0 0 700 218"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="var(--maximeheckel-colors-typeface-primary)"
    >
      <g clipPath="url(#clip0)">
        <g opacity="0.4" filter="url(#filter0_f)">
          <path
            d="M410.534 81.1764C410.534 110.557 371.688 169.571 276.765 169.571C181.843 169.571 53.1709 143.633 53.1709 114.252C53.1709 84.8715 65.6687 48 160.591 48C255.514 48 410.534 51.7955 410.534 81.1764Z"
            fill="#FF008C"
          />
        </g>
        <g opacity="0.5" filter="url(#filter1_f)">
          <path
            d="M661.5 114.486C661.5 143.971 635.186 170 536.18 170C437.173 170 302.965 143.971 302.965 114.486C302.965 85.0015 236.87 48 415.007 48C693.172 48 661.5 85.0015 661.5 114.486Z"
            fill="#336EF5"
          />
        </g>
        <rect
          x="308.604"
          y="89.9522"
          width="13.8414"
          height="32.8933"
          rx="6.92069"
          strokeWidth="3"
        />
        <path
          d="M308.696 93.775C310.58 90.6447 314.892 89.1137 318.328 90.3553C321.763 91.597 323.022 95.1412 321.138 98.2715L308.853 118.689C306.97 121.82 302.658 123.351 299.222 122.109C295.786 120.867 294.528 117.323 296.411 114.193L302.554 103.984L308.696 93.775Z"
          strokeWidth="3"
        />
        <path
          d="M299.679 107.864L299.679 107.864L299.672 107.875L293.344 118.593C291.649 121.463 287.708 122.878 284.568 121.743C281.447 120.615 280.304 117.396 282.015 114.552L294.95 93.0546C296.647 90.234 300.532 88.8544 303.628 89.9732C306.725 91.0926 307.859 94.2883 306.159 97.1095L299.679 107.864Z"
          strokeWidth="3"
        />
        <path
          d="M381.6 92.3336H414.934C417.225 92.3336 419.1 94.2086 419.1 96.5003V121.5C419.1 123.792 417.225 125.667 414.934 125.667H381.6C379.309 125.667 377.434 123.792 377.434 121.5V96.5003C377.434 94.2086 379.309 92.3336 381.6 92.3336Z"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M419.1 96.5003L398.267 111.084L377.434 96.5003"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M343 109H357"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M350 102L357 109L350 116"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  </div>
);
