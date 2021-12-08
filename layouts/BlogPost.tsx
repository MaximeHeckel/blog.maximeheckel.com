import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import siteConfig from 'config/site';
import Layout from '@theme/layout';
import Grid from '@theme/components/Grid';
import TableOfContent from '@theme/components/TableOfContent';
import Anchor from '@theme/components/Anchor';
import Seo from '@theme/components/Seo';
import Hero from '@theme/components/Hero';
import WebmentionCount from '@theme/components/Webmentions/WebmentionCount';
import Flex from '@theme/components/Flex';
import Pill from '@theme/components/Pill';
import Text from '@theme/components/Typography';
import { Post, ReadingTime } from 'types/post';
import Signature from './Signature';
import { css } from 'lib/stitches.config';

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

const contentClass = css({
  padding: '20px 0px',
  gridColumn: '2',
  color: 'var(--maximeheckel-colors-typeface-secondary)',

  h3: {
    marginTop: '2em',
  },

  section: {
    marginTop: '5em',
  },
});

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
            <div
              style={{ marginBottom: '24px', fontSize: 'var(--font-size-2)' }}
            >
              <Link href="/" passHref>
                <Anchor arrow="left" discreet>
                  Home
                </Anchor>
              </Link>
            </div>
            <Hero.Title
              className="p-name"
              data-testid={`project-title-${title}`}
            >
              {title}
            </Hero.Title>
            <Hero.Info>
              <Flex
                css={{
                  marginBottom: '12px',
                }}
                wrap="wrap"
              >
                <Text
                  as="p"
                  size="1"
                  variant="tertiary"
                  weight="3"
                  css={{ marginBottom: '0px' }}
                >
                  {format(new Date(Date.parse(date)), 'MMMM d, yyyy')} /{' '}
                  {readingTime.text} /
                </Text>
                <WebmentionCount target={postUrl} />
              </Flex>
              <Flex
                css={{
                  marginLeft: '-8px',
                }}
              >
                <Pill variant="info">
                  Last Updated{' '}
                  {format(new Date(Date.parse(updated)), 'MMMM d, yyyy')}
                </Pill>
              </Flex>
            </Hero.Info>
            {cover ? <Hero.Img className="u-photo" src={cover} /> : null}
          </Hero>
          <TableOfContent ids={ids} />
          <div className={contentClass()}>{children}</div>
        </Grid>
        <Signature title={title} url={postUrl} />
        <WebmentionBlogData date={date} postUrl={postUrl} subtitle={subtitle} />
      </article>
    </Layout>
  );
};

export default BlogLayout;
