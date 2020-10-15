/** @jsx jsx */
import { jsx, Global, css } from '@emotion/core';

const LocalLogo = ({ color }) => (
  <svg
    width="60"
    height="50"
    viewBox="0 0 595 503"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="379.732"
      y="44.0664"
      width="172.095"
      height="418.666"
      rx="86.0473"
      strokeWidth="30"
      stroke={color}
      fill="none"
    />
    <path
      d="M232.281 351.918L307.25 222.126L382.22 92.3337C405.107 52.7097 458.377 33.6572 501.202 49.7787C544.027 65.9003 560.19 111.091 537.303 150.715L387.364 410.299C364.477 449.923 311.206 468.976 268.381 452.854C225.556 436.733 209.393 391.542 232.281 351.918Z"
      stroke={color}
      strokeWidth="30"
    />
    <path
      d="M278.524 272.8L278.491 272.857L278.458 272.915L201.357 408.94C180.688 445.407 131.823 463.076 92.5408 448.288C53.4859 433.586 38.7461 392.374 59.6185 356.238L217.152 83.5054C237.86 47.6548 286.057 30.4167 324.804 45.0032C363.568 59.5961 378.184 100.511 357.443 136.368L278.524 272.8Z"
      stroke={color}
      strokeWidth="30"
    />
  </svg>

  // <svg
  //   width="60"
  //   height="50"
  //   viewBox="0 0 595 503"
  //   fill="none"
  //   xmlns="http://www.w3.org/2000/svg"
  // >
  //   <rect
  //     x="375.955"
  //     y="44.1826"
  //     width="170"
  //     height="420.461"
  //     rx="85"
  //     strokeWidth="30"
  //     stroke={color}
  //     fill="#141516"
  //   />
  //   <path
  //     d="M532.053 150.507L382.796 412.659C360.385 452.022 307.914 470.831 265.599 454.671C223.284 438.51 207.149 393.499 229.561 354.136L378.817 91.9835C401.228 52.6204 453.699 33.8111 496.014 49.9718C538.329 66.1325 554.464 111.143 532.053 150.507Z"
  //     strokeWidth="30"
  //     stroke={color}
  //     fill="#141516"
  //   />
  //   <rect
  //     x="208.566"
  //     y="42.0908"
  //     width="170"
  //     height="420.461"
  //     rx="85"
  //     strokeWidth="30"
  //     stroke={color}
  //     fill="#141516"
  //   />
  //   <path
  //     d="M364.791 148.503L215.535 410.655C193.123 450.018 140.652 468.827 98.3375 452.667C56.0226 436.506 39.8875 391.495 62.2988 352.132L211.555 89.9796C233.966 50.6165 286.437 31.8072 328.752 47.9679C371.067 64.1286 387.202 109.14 364.791 148.503Z"
  //     strokeWidth="30"
  //     stroke={color}
  //     fill="#141516"
  //   />
  // </svg>
);

const PrinterComponent = ({ title, colorFeatured, fontFeatured }) => {
  return (
    <div
      css={{
        width: '1200px',
        height: '630px',
        background: colorFeatured || '#141516',
      }}
    >
      <Global
        styles={css`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap');

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Inter', Helvetica, sans-serif;
          }
        `}
      />
      <div
        css={{
          padding: '140px 145px 120px 145px',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '840px',
            height: '330px',
            maxheight: '330px',
          }}
        >
          <h1
            css={{
              fontSize: '64px',
              lineHeight: '73.59px',
              color: fontFeatured || '#FEFEFE',
              fontWeight: 600,
              fontStyle: 'normal',
              textAlign: 'center',
            }}
          >
            {title}
          </h1>
        </div>
        <div
          css={{
            color: fontFeatured || '#FEFEFE',
            justifyContent: 'space-between',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LocalLogo color={fontFeatured || '#FEFEFE'} />
          <span
            css={{
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            @MaximeHeckel
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrinterComponent;
