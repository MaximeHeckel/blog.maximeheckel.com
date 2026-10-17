import localFont from 'next/font/local';

const inter = localFont({
  src: '../../public/fonts/InterVariable.woff2',
  style: 'normal',
  weight: '100 900',
  variable: '--font-display',
  declarations: [{ prop: 'font-family', value: 'inter' }],
});

const interItalic = localFont({
  src: '../../public/fonts/InterVariable-Italic.woff2',
  style: 'italic',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false,
  // Share the family so font-style selects the real italic face.
  declarations: [{ prop: 'font-family', value: 'inter' }],
});

const FiraCode = localFont({
  src: '../../public/fonts/fira-code.woff2',
  variable: '--font-mono-code',
  preload: false,
});

const DepartureMono = localFont({
  src: '../../public/fonts/DepartureMono-Regular.woff2',
  variable: '--font-mono',
});

const Fonts = () => (
  <style jsx global>{`
    :root {
      --font-display: ${inter.style.fontFamily};
      /* Retain the italic declaration without adding a global preload. */
      --font-display-italic: ${interItalic.style.fontFamily};
      --font-mono: ${DepartureMono.style.fontFamily};
      --font-mono-code: ${FiraCode.style.fontFamily};
      font: 100%/1.2888 var(--font-display);
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      --font-settings: 'cv11' 1, 'cv05' 1;
      --font-variation-settings: 'opsz' auto;
      font-feature-settings: var(--font-settings);
      font-variation-settings: var(--font-variation-settings);
      text-rendering: optimizeLegibility;
    }
  `}</style>
);

export { Fonts };
