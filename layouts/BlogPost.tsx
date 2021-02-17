import { css } from '@emotion/react';
import dynamic from 'next/dynamic';
import React from 'react';
import siteConfig from 'config/site';
import Layout from '@theme/layouts';
import Seo from '@theme/components/Seo';
import Hero from '@theme/components/Hero';
import { WebmentionCount } from '@theme/components/Webmentions';
import Flex from '@theme/components/Flex';
import { MONTHS } from '@theme/constants';
import { MDXBody } from '@theme/components/MDX/MDX';
import Pill from '@theme/components/Pill';

import { Post, ReadingTime } from 'types/post';
import Signature from './Signature';

const ProgressBar = dynamic(() => import('@theme/components/ProgressBar'), {
  ssr: false,
});
interface Props {
  children: React.ReactNode;
  frontMatter: Post & { readingTime: ReadingTime };
  ogImage: string;
}

const BlogLayout = ({ children, frontMatter, ogImage }: Props) => {
  const {
    date,
    updated,
    slug,
    subtitle,
    title,
    readingTime,
    cover,
  } = frontMatter;
  const progressBarTarget = React.useRef<HTMLDivElement>(null);
  const parsedDate = new Date(Date.parse(date));
  const parsedLastUpdated = new Date(Date.parse(updated));
  const path = `/posts/${slug}/`;
  const postUrl = `${siteConfig.url}${path}`;

  const headerProps = {
    title,
    sticky: true,
    collapsableOnScroll: true,
    search: true,
  };

  return (
    <Layout footer={true} header={true} headerProps={headerProps}>
      <article className="h-entry">
        <Seo
          title={`${title}`}
          desc={subtitle}
          image={ogImage}
          path={path}
          date={date}
          updated={updated}
        />
        <Hero id="top">
          <Hero.Title className="p-name" data-testid={`project-title-${title}`}>
            {title}
          </Hero.Title>
          <Hero.Info>
            <Flex
              css={css`
                margin-bottom: 16px;
              `}
              wrap="wrap"
            >
              {date ? (
                <p>
                  {MONTHS[parsedDate.getMonth()]} {parsedDate.getDate()}{' '}
                  {parsedDate.getFullYear()}
                </p>
              ) : null}
              {readingTime.text ? <p> / {readingTime.text} / </p> : null}
              <WebmentionCount target={postUrl} />
            </Flex>
            {updated ? (
              <Pill
                color="var(--maximeheckel-colors-emphasis)"
                text={`Last Updated ${MONTHS[parsedLastUpdated.getMonth()]} 
              ${parsedLastUpdated.getDate()} 
              ${parsedLastUpdated.getFullYear()}`}
              />
            ) : null}
          </Hero.Info>
          <ProgressBar id={slug} target={progressBarTarget} />
          {cover ? <Hero.Img className="u-photo" src={cover} /> : null}
        </Hero>
        <MDXBody ref={progressBarTarget}>{children}</MDXBody>
        <Signature title={title} url={postUrl} />
        <time
          className="hidden dt-published"
          itemProp="datepublished"
          dateTime={date}
        >
          {new Date(date).toISOString().replace('Z', '') + '+01:00'}
        </time>
        <a className="hidden u-url" href={`${siteConfig.url}/posts/${slug}`} />
        {subtitle && <p className="hidden p-summary e-content">{subtitle}</p>}
      </article>
    </Layout>
  );
};

export default BlogLayout;
