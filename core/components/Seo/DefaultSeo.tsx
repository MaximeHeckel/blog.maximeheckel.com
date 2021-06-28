import { DefaultSeo as NextDefaultSeo, BlogJsonLd } from 'next-seo';
import React from 'react';
import siteConfig from '../../../config/site';

interface Props {
  title?: string;
}

const DefaultSeo = (props: Props) => (
  <React.Fragment>
    <NextDefaultSeo
      title={props.title || siteConfig.title}
      description={siteConfig.description}
      canonical={siteConfig.url}
      openGraph={{
        type: 'website',
        locale: 'en_IE',
        url: siteConfig.url,
        title: siteConfig.title,
        description: siteConfig.description,
        images: [
          {
            url: siteConfig.image,
            alt: siteConfig.title,
            width: 1280,
            height: 720,
          },
        ],
      }}
      twitter={{
        handle: siteConfig.twitter,
        site: siteConfig.twitter,
        cardType: 'summary_large_image',
      }}
    />
    <BlogJsonLd
      authorName={siteConfig.author}
      dateModified={new Date().toISOString()}
      datePublished={new Date().toISOString()}
      description={siteConfig.description}
      images={[siteConfig.image]}
      title={siteConfig.title}
      url={siteConfig.url}
    />
  </React.Fragment>
);

export { DefaultSeo };
