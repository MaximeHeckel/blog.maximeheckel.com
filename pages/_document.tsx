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
            href="/static/favicons/apple-touch-icon.png?v=2"
            rel="apple-touch-icon"
            sizes="180x180"
          />
          {[196, 128, 96, 32, 16].flatMap((size) =>
            ['light', 'dark'].map((theme) => (
              <link
                key={`${size}-${theme}`}
                href={`/static/favicons/favicon-${size}x${size}${theme === 'light' ? '-light' : ''}.png?v=2`}
                rel="icon"
                sizes={`${size}x${size}`}
                type="image/png"
                media={`(prefers-color-scheme: ${theme})`}
              />
            ))
          )}
          <link
            href="/static/favicons/favicon.svg?v=2"
            rel="icon"
            sizes="any"
            type="image/svg+xml"
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
