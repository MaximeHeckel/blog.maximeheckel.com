import { Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';

const inter = localFont({
  src: '../../public/fonts/InterVariable.woff2',
  variable: '--font-display',
});
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
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
      --font-serif: ${instrument.style.fontFamily};
      --font-mono: ${DepartureMono.style.fontFamily};
      --font-mono-code: ${FiraCode.style.fontFamily};
      font: 100%/1.2888 var(--font-display);
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
  `}</style>
);

export { Fonts };
