import {
  css,
  Anchor,
  Box,
  Flex,
  Grid,
  Pill,
  Text,
} from '@maximeheckel/design-system';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import siteConfig from 'config/site';
import Layout from '@theme/layout';
import TableOfContent from '@theme/components/TableOfContent';
import Seo from '@theme/components/Seo';
import Hero from '@theme/components/Hero';
import WebmentionCount from '@theme/components/Webmentions/WebmentionCount';
import { Post, ReadingTime } from 'types/post';
import Signature from './Signature';

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
  padding: 'var(--space-5) 0px',
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
    offsetHeight: 256,
    showProgressBarOnMobile: true,
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
        <Grid columns="small" gapX={4}>
          <Hero>
            <Box css={{ marginBottom: '24px', fontSize: 'var(--font-size-2)' }}>
              <Link href="/" passHref>
                <Anchor arrow="left" data-testid="home-link" discreet>
                  Home
                </Anchor>
              </Link>
            </Box>
            <Hero.Title
              className="p-name"
              data-testid={`project-title-${title}`}
            >
              {title}
            </Hero.Title>
            <Hero.Info>
              <Flex
                css={{
                  marginBottom: 'var(--space-3)',
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
                  marginLeft: '-var(--space-2)',
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
          <Box className={contentClass()}>{children}</Box>
        </Grid>
        <Signature title={title} url={postUrl} />
        <WebmentionBlogData date={date} postUrl={postUrl} subtitle={subtitle} />
      </article>
    </Layout>
  );
};

export default BlogLayout;
