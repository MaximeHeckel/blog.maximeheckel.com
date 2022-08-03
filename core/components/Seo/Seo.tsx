import { NextSeo, ArticleJsonLd } from 'next-seo';
import Head from 'next/head';
import React from 'react';
import siteConfig from '../../../config/site';

interface Props {
  image?: string;
  desc?: string;
  path?: string;
  title?: string;
  date?: string;
  updated?: string;
}

const Seo = ({ title, desc, image, path, date, updated }: Props) => {
  const {
    title: configTitle,
    description: configDescription,
    image: configImage,
    url,
    author,
    twitter,
  } = siteConfig;

  const seo = {
    description: desc || configDescription,
    image: image ? `${url}${image}` : configImage,
    title: `${title} - ${configTitle}` || configTitle,
    url: `${url}${path || ''}`,
    date: date,
    updated: updated || date,
  };

  const formattedDate = seo.date ? new Date(seo.date).toISOString() : '';
  const formattedUpdatedDate = seo.updated
    ? new Date(seo.updated).toISOString()
    : '';
  const featuredImage = {
    url: `${seo.image}?v1`,
    alt: seo.title,
  };

  return (
    <React.Fragment>
      <NextSeo
        title={seo.title}
        description={seo.description}
        canonical={seo.url}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: formattedDate,
            modifiedTime: formattedUpdatedDate,
          },
          url: seo.url,
          title: seo.title,
          description: seo.description,
          images: [featuredImage],
        }}
        twitter={{
          handle: twitter,
          site: twitter,
          cardType: 'summary_large_image',
        }}
      />
      <Head>
        <meta name="twitter:image" content={featuredImage.url} />
        <meta name="twitter:image:alt" content={featuredImage.alt} />
        <meta name="twitter:description" content={seo.description} />
        <meta property="twitter:image:width" content="1280" />
        <meta property="twitter:image:height" content="720" />
        <meta name="googlebot" content="index,follow" />
      </Head>
      <ArticleJsonLd
        authorName={author}
        dateModified={formattedDate}
        datePublished={formattedDate}
        description={seo.description}
        images={[seo.image]}
        publisherLogo="/static/favicons/android-chrome-192x192.png"
        publisherName={author}
        title={seo.title}
        url={seo.url}
      />
    </React.Fragment>
  );
};

export { Seo };
