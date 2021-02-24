import { css } from '@emotion/react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import React from 'react';
import siteConfig from 'config/site';
import Layout from '@theme/layouts';
import Seo from '@theme/components/Seo';
import Hero from '@theme/components/Hero';
import WebmentionCount from '@theme/components/Webmentions/WebmentionCount';
import Flex from '@theme/components/Flex';
import MDXBody from '@theme/components/MDX/MDX';
import Pill, { PillVariant } from '@theme/components/Pill';
import { Post, ReadingTime } from 'types/post';
import Signature from './Signature';

const ProgressBar = dynamic(() => import('@theme/components/ProgressBar'), {
  ssr: false,
});

interface WebmentionBlogDataProps {
  date: string;
  postUrl: string;
  subtitle?: string;
}

const WebmentionBlogData = (props: WebmentionBlogDataProps) => {
  const { date, postUrl, subtitle } = props;

  return (
    <>
      <time
        className="hidden dt-published"
        itemProp="datepublished"
        dateTime={date}
      >
        {new Date(date).toISOString().replace('Z', '') + '+01:00'}
      </time>
      <a className="hidden u-url" href={postUrl} />
      {subtitle && <p className="hidden p-summary e-content">{subtitle}</p>}
    </>
  );
};

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
              <p>{format(new Date(Date.parse(date)), 'MMM dd yyyy')}</p>
              <p> / {readingTime.text} / </p>
              <WebmentionCount target={postUrl} />
            </Flex>
            <Pill variant={PillVariant.INFO}>
              Last Updated{' '}
              {format(new Date(Date.parse(updated)), 'MMM dd yyyy')}
            </Pill>
          </Hero.Info>
          {cover ? <Hero.Img className="u-photo" src={cover} /> : null}
        </Hero>
        <ProgressBar id={slug} target={progressBarTarget} />
        <MDXBody ref={progressBarTarget}>{children}</MDXBody>
        <Signature title={title} url={postUrl} />
        <WebmentionBlogData date={date} postUrl={postUrl} subtitle={subtitle} />
      </article>
    </Layout>
  );
};

export default BlogLayout;