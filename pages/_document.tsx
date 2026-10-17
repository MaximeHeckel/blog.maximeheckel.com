import { getCssText } from '@maximeheckel/design-system';
import { HERO_THEME_COLOR, PAGE_THEME_COLOR } from 'lib/browserTheme';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    const isHomePage = this.props.__NEXT_DATA__.page === '/';

    return (
      <Html lang="en" className="maximeheckel-dark">
        <Head>
          <meta
            name="theme-color"
            content={isHomePage ? HERO_THEME_COLOR : PAGE_THEME_COLOR}
          />
          <link
            href="/static/favicons/apple-touch-icon.png"
            rel="apple-touch-icon"
            sizes="180x180"
          />
          <link
            href="/static/favicons/favicon-196x196.png"
            rel="icon"
            sizes="196x196"
            type="image/png"
          />
          <link
            href="/static/favicons/favicon-128x128.png"
            rel="icon"
            sizes="128x128"
            type="image/png"
          />
          <link
            href="/static/favicons/favicon-96x96.png"
            rel="icon"
            sizes="96x96"
            type="image/png"
          />
          <link
            href="/static/favicons/favicon-32x32.png"
            rel="icon"
            sizes="32x32"
            type="image/png"
          />
          <link
            href="/static/favicons/favicon-16x16.png"
            rel="icon"
            sizes="16x16"
            type="image/png"
          />
          <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
          <link
            rel="webmention"
            href="https://webmention.io/blog.maximeheckel.com/webmention"
          />
          <link
            rel="pingback"
            href="https://webmention.io/blog.maximeheckel.com/xmlrpc"
          />
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        </Head>
        <body className="maximeheckel-dark">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
