import Typography from 'typography';

const typography = new Typography({
  baseFontSize: '16px',
  baseLineHeight: '28px',
  headerFontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
  bodyFontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
  overrideStyles: () => ({
    h1: {
      fontWeight: 500,
      fontSize: '32px',
      lineHeight: 1.5,
    },
    h2: {
      fontWeight: 600,
      fontSize: '23px',
      lineHeight: 1.4,
    },
    h4: {
      lineHeight: 2,
    },
  }),
});

export default typography;
