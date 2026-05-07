import localFont from 'next/font/local';

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/InterVariable.woff2',
      style: 'normal',
      weight: '100 900',
    },
    {
      path: '../../public/fonts/InterVariable-Italic.woff2',
      style: 'italic',
      weight: '100 900',
    },
  ],
  variable: '--font-display',
});

const FiraCode = localFont({
  src: '../../public/fonts/fira-code.woff2',
  variable: '--font-mono-code',
});

const DepartureMono = localFont({
  src: '../../public/fonts/DepartureMono-Regular.woff2',
  variable: '--font-mono',
});

const Fonts = () => (
  <style jsx global>{`
    :root {
      --font-display: ${inter.style.fontFamily};
      --font-mono: ${DepartureMono.style.fontFamily};
      --font-mono-code: ${FiraCode.style.fontFamily};
      font: 100%/1.2888 var(--font-display);
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      font-feature-settings: 'cv11' 1, 'cv05' 1;
    }
  `}</style>
);

export { Fonts };
