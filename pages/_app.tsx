import {
  globalStyles,
  ThemeProvider,
  Tooltip,
} from '@maximeheckel/design-system';
import { Analytics } from '@vercel/analytics/react';
import { AppProps } from 'next/app';
import { Inter, Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import 'styles/font.css';
import 'styles/global.css';

import { DefaultSeo } from '@core/components/Seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-display' });
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

const FiraCode = localFont({
  src: '../public/fonts/fira-code.woff2',
  variable: '--font-mono-code',
});

const DepartureMono = localFont({
  src: '../public/fonts/DepartureMono-Regular.woff2',
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

const App = ({ Component, pageProps }: AppProps) => {
  globalStyles();

  return (
    <ThemeProvider>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta
          name="google-site-verification"
          content="f11boUvGIzjbYwQVuaCieN-J4vcA_BxJuO_S54WPf-U"
        />
      </Head>
      <DefaultSeo />
      <Fonts />
      <Tooltip.Provider>
        <Component {...pageProps} />
      </Tooltip.Provider>
      <Analytics />
    </ThemeProvider>
  );
};
export default App;
