import Head from 'next/head';
import { AppProps } from 'next/app';
import { DefaultSeo } from '@theme/components/Seo';
import RootWrapper from '@theme/context/ThemeProvider';
import 'styles/global.css';
import 'styles/font.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <RootWrapper>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <DefaultSeo />
      <Component {...pageProps} />
    </RootWrapper>
  );
};
export default App;
