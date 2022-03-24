import Head from 'next/head';
import { AppProps } from 'next/app';
import { globalStyles } from '@maximeheckel/design-system';
import { DefaultSeo } from '@theme/components/Seo';
import RootWrapper from '@theme/context/ThemeProvider';
import 'styles/global.css';
import 'styles/font.css';

const App = ({ Component, pageProps }: AppProps) => {
  globalStyles();

  return (
    <RootWrapper>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta
          name="google-site-verification"
          content="f11boUvGIzjbYwQVuaCieN-J4vcA_BxJuO_S54WPf-U"
        />
      </Head>
      <DefaultSeo />
      <Component {...pageProps} />
    </RootWrapper>
  );
};
export default App;
