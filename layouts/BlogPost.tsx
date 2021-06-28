import { css } from '@emotion/react';
import { format } from 'date-fns';
import React from 'react';
import siteConfig from 'config/site';
import Layout from '@theme/layout';
import Seo from '@theme/components/Seo';
import Hero from '@theme/components/Hero';
import WebmentionCount from '@theme/components/Webmentions/WebmentionCount';
import Flex from '@theme/components/Flex';
import MDXBody from '@theme/components/MDX/MDX';
import Pill, { PillVariant } from '@theme/components/Pill';
import { Post, ReadingTime } from 'types/post';
import Signature from './Signature';
import Grid from '@theme/components/Grid';
import TableOfContent from '@theme/components/TableOfContent';

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
  const path = `/posts/${slug}/`;
  const postUrl = `${siteConfig.url}${path}`;

  const headerProps = {
    title,
    sticky: true,
    collapsableOnScroll: true,
    search: true,
    progress: true,
  };

  const [ids, setIds] = React.useState<Array<{ id: string; title: string }>>(
    []
  );

  React.useEffect(() => {
    /**
     * Working around some race condition quirks :) (don't judge)
     * TODO @MaximeHeckel: see if there's a better way through a remark plugin to do this
     */
    setTimeout(() => {
      const titles = document.querySelectorAll('h2');
      const idArrays = Array.prototype.slice
        .call(titles)
        .map((title) => ({ id: title.id, title: title.innerText })) as Array<{
        id: string;
        title: string;
      }>;
      setIds(idArrays);
    }, 500);
  }, [slug]);

  return (
    <Layout footer={true} header={true} headerProps={headerProps}>
      <Seo
        title={title}
        desc={subtitle}
        image={ogImage}
        path={path}
        date={date}
        updated={updated}
      />
      <article className="h-entry">
        <Grid columns="var(--layout-small)" columnGap={20}>
          <Hero id="top">
            <Hero.Title
              className="p-name"
              data-testid={`project-title-${title}`}
            >
              {title}
            </Hero.Title>
            <Hero.Info>
              <Flex
                css={css`
                  margin-bottom: 16px;
                `}
                wrap="wrap"
              >
                <p>{format(new Date(Date.parse(date)), 'MMMM d, yyyy')}</p>
                <p> / {readingTime.text} / </p>
                <WebmentionCount target={postUrl} />
              </Flex>
              <Pill variant={PillVariant.INFO}>
                Last Updated{' '}
                {format(new Date(Date.parse(updated)), 'MMMM d, yyyy')}
              </Pill>
            </Hero.Info>
            {cover ? <Hero.Img className="u-photo" src={cover} /> : null}
          </Hero>
        </Grid>
        <TableOfContent ids={ids} />
        <MDXBody>{children}</MDXBody>
        <Signature title={title} url={postUrl} />
        <WebmentionBlogData date={date} postUrl={postUrl} subtitle={subtitle} />
      </article>
    </Layout>
  );
};

export default BlogLayout;
