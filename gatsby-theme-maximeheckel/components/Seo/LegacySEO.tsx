import Head from 'next/head';
import SchemaOrg from './SchemaOrg';
import siteConfig from '../../../config/site';

interface SEOProps {
  article?: boolean;
  image?: string;
  desc?: string;
  path?: string;
  title?: string;
  date?: string;
}

const SEO = ({ title, desc, image, path, article, date }: SEOProps) => {
  const {
    title: defaultTitle,
    description: defaultDescription,
    image: defaultImage,
    siteUrl,
    twitter,
    author,
    keywords,
  } = siteConfig;

  const seo = {
    description: desc || defaultDescription,
    image: image || defaultImage,
    title: title || defaultTitle,
    url: `${siteUrl}${path || ''}`,
    date: date ? date : '',
    keywords,
  };

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.image ? <meta name="image" content={seo.image} /> : null}
        <link rel="canonical" href={seo.url} />
        <meta property="og:url" content={seo.url} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        {seo.image ? <meta property="og:image" content={seo.image} /> : null}
        {(article ? true : null) && (
          <meta property="og:type" content="article" />
        )}
        <meta
          name="keywords"
          content={
            seo.keywords && seo.keywords.length > 0
              ? seo.keywords.join(`, `)
              : ''
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content={twitter} />
        <meta name="twitter:site" content={twitter} />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        {seo.image ? <meta name="twitter:image" content={seo.image} /> : null}
      </Head>
      <SchemaOrg
        isBlogPost={article || false}
        url={seo.url}
        title={seo.title}
        image={seo.image}
        description={seo.description}
        datePublished={seo.date}
        canonicalUrl={seo.url}
        author={{ name: author }}
        defaultTitle={defaultTitle}
      />
    </>
  );
};

SEO.defaultProps = {
  article: false,
};

export { SEO };
