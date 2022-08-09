import Head from 'next/head';
import { AppProps } from 'next/app';
import {
  globalStyles,
  ThemeProvider,
  Tooltip,
} from '@maximeheckel/design-system';
import { DefaultSeo } from '@theme/components/Seo';
import 'styles/global.css';
import 'styles/font.css';

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
      <Tooltip.Provider>
        <Component {...pageProps} />
      </Tooltip.Provider>
    </ThemeProvider>
  );
};
export default App;
