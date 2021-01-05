import React from 'react';
import { NextSeo, ArticleJsonLd } from 'next-seo';
import siteConfig from '../../../config/site';

interface Props {
  image?: string;
  desc?: string;
  path?: string;
  title?: string;
  date?: string;
}

const Seo = ({ title, desc, image, path, date }: Props) => {
  const {
    title: configTitle,
    description: configDescription,
    image: configImage,
    url,
    keywords,
    author,
    twitter,
  } = siteConfig;

  const seo = {
    description: desc || configDescription,
    image: `${url}${image}` || configImage,
    title: `${title} - ${configTitle}` || configTitle,
    url: `${url}${path || ''}`,
    date: date ? date : '',
    keywords,
  };

  const formattedDate = new Date(seo.date).toISOString();
  const featuredImage = {
    url: seo.image,
    alt: seo.title,
  };

  return (
    <>
      <NextSeo
        title={seo.title}
        description={seo.description}
        canonical={seo.url}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: formattedDate,
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
    </>
  );
};

export { Seo };
