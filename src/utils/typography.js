import Typography from 'typography';

const typography = new Typography({
  baseFontSize: '16px',
  baseLineHeight: '28px',
  headerFontFamily: [
    'Inter',
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
    'Inter',
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
  googleFonts: [
    {
      name: 'Inter',
      styles: ['300', '400', '500', '600', '700'],
    },
  ],
  overrideStyles: () => ({
    h1: {
      fontWeight: 600,
      fontSize: '38px',
      lineHeight: 1.666,
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
      lineHeight: 1.9,
      letterSpacing: '0.3px',
      marginBottom: '2.25rem',
    },
    code: {
      fontFamily: 'Fira Code',
    },
    li: {
      fontSize: '18px',
      lineHeight: 1.9,
      letterSpacing: '0.3px',
    },
  }),
});

export default typography;
