import React from 'react';
import Head from 'next/head';

interface Props {
  author: {
    name: string;
  };
  canonicalUrl: string;
  datePublished: string;
  defaultTitle: string;
  description: string;
  image: string;
  isBlogPost: boolean;
  title: string;
  url: string;
}

const SchemaOrg = React.memo(
  ({
    author,
    canonicalUrl,
    datePublished,
    defaultTitle,
    description,
    image,
    isBlogPost,
    title,
    url,
  }: Props) => {
    const baseSchema = [
      {
        '@context': 'http://schema.org',
        '@type': 'WebSite',
        url,
        name: title,
        alternateName: defaultTitle,
      },
    ];

    const schema = isBlogPost
      ? [
          ...baseSchema,
          {
            '@context': 'http://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                item: {
                  '@id': url,
                  name: title,
                  image,
                },
              },
            ],
          },
          {
            '@context': 'http://schema.org',
            '@type': 'BlogPosting',
            url,
            name: title,
            alternateName: defaultTitle,
            headline: title,
            image: {
              '@type': 'ImageObject',
              url: image,
            },
            description,
            author: {
              '@type': 'Person',
              name: author,
            },
            mainEntityOfPage: {
              '@type': 'WebSite',
              '@id': canonicalUrl,
            },
            datePublished,
          },
        ]
      : baseSchema;

    return (
      <Head>
        {/* Schema.org tags */}
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
    );
  }
);

export default SchemaOrg;
