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
      fontSize: '38px',
      lineHeight: 1.5,
    },
    h2: {
      fontWeight: 600,
      fontSize: '25px',
      lineHeight: 1.333,
    },
    h3: {
      lineHeight: 1.6,
      fontWeight: 600,
    },
    h4: {
      lineHeight: 2,
    },
    p: {
      fontSize: '18px',
      lineHeight: 1.75,
      letterSpacing: '0.5px',
      marginBottom: '2.25rem',
    },
    code: {
      fontFamily: 'Fira Code',
    },
    li: {
      fontSize: '18px',
      lineHeight: 1.65,
      letterSpacing: '0.5px',
    },
  }),
});

export default typography;
