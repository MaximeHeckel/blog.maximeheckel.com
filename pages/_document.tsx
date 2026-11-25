import { HERO_THEME_COLOR, PAGE_THEME_COLOR } from 'lib/browserTheme';
import Document, { Html, Head, Main, NextScript } from 'next/document';

const faviconSizes = [196, 128, 96, 32, 16];

// Give each scheme its own cache key without relying on SVG media queries
// being evaluated when a browser saves a favicon for its UI.
const syncFavicon = `(() => {
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const icons = document.querySelectorAll('link[data-favicon-light]');
  const sync = () => {
    for (const icon of icons) {
      const href = scheme.matches ? icon.dataset.faviconDark : icon.dataset.faviconLight;
      if (icon.getAttribute('href') !== href) icon.setAttribute('href', href);
    }
  };
  sync();
  scheme.addEventListener('change', sync);
})();`;

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
          {faviconSizes.map((size) => {
            const path = `/static/favicons/favicon-${size}x${size}`;
            const light = `${path}-light.png?v=4`;

            return (
              <link
                key={size}
                href={light}
                rel="icon"
                sizes={`${size}x${size}`}
                type="image/png"
                data-favicon-light={light}
                data-favicon-dark={`${path}.png?v=4`}
              />
            );
          })}
          <link
            href="/static/favicons/favicon.svg?v=4"
            rel="icon"
            sizes="any"
            type="image/svg+xml"
            data-favicon-light="/static/favicons/favicon-light.svg?v=4"
            data-favicon-dark="/static/favicons/favicon-dark.svg?v=4"
          />
          <script dangerouslySetInnerHTML={{ __html: syncFavicon }} />
          <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
          <link
            rel="webmention"
            href="https://webmention.io/blog.maximeheckel.com/webmention"
          />
          <link
            rel="pingback"
            href="https://webmention.io/blog.maximeheckel.com/xmlrpc"
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
