import { globalStyles, Tooltip } from '@maximeheckel/design-system';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AppProps } from 'next/app';
import 'styles/global.css';
import Head from 'next/head';

import { CommandMenuProvider } from '@core/components/CommandMenu';
import { Fonts } from '@core/components/Fonts';
import { DefaultSeo } from '@core/components/Seo';

const Meta = () => {
  return (
    <>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta
          name="google-site-verification"
          content="f11boUvGIzjbYwQVuaCieN-J4vcA_BxJuO_S54WPf-U"
        />
      </Head>
      <DefaultSeo />
    </>
  );
};

const App = ({ Component, pageProps }: AppProps) => {
  globalStyles();

  return (
    <>
      <Meta />
      <Fonts />
      <Analytics />
      <SpeedInsights />
      <CommandMenuProvider>
        <Tooltip.Provider>
          <Component {...pageProps} />
        </Tooltip.Provider>
      </CommandMenuProvider>
    </>
  );
};
export default App;
