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
import Layout from '@core/layout';
import TableOfContent from '@core/components/TableOfContent';
import Seo from '@core/components/Seo';
import Hero from '@core/components/Hero';
import { Post, ReadingTime } from 'types/post';
import Signature from './Signature';
import Balancer from 'react-wrap-balancer';
import { templateColumnsSmall } from 'styles/grid';

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
  color: 'var(--maximeheckel-colors-typeface-secondary)',

  h2: {
    marginTop: '2em',
  },

  h3: {
    marginTop: '1.45em',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)',
    maxWidth: 700,
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
        <Grid gapX={4} templateColumns={templateColumnsSmall}>
          <Grid.Item col={2}>
            <Hero>
              <Box
                css={{ marginBottom: '16px', fontSize: 'var(--font-size-2)' }}
              >
                <Link href="/" legacyBehavior passHref>
                  <Anchor arrow="left" data-testid="home-link" discreet>
                    Home
                  </Anchor>
                </Link>
              </Box>
              <Hero.Title
                className="p-name"
                data-testid={`project-title-${title}`}
              >
                <Balancer ratio={0.5}>{title}</Balancer>
              </Hero.Title>
              <Hero.Info>
                <Flex
                  css={{
                    marginBottom: 'var(--space-3)',
                  }}
                  gap="3"
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
                    {readingTime.text}
                  </Text>
                  <Pill variant="info">
                    Last Updated:{' '}
                    {format(new Date(Date.parse(updated)), 'MMMM d, yyyy')}
                  </Pill>
                  {/* <WebmentionCount target={postUrl} /> */}
                </Flex>
              </Hero.Info>
              {cover ? <Hero.Img className="u-photo" src={cover} /> : null}
            </Hero>
          </Grid.Item>
          <TableOfContent ids={ids} />
          <Grid.Item col={2}>
            <Flex
              alignItems="start"
              direction="column"
              className={contentClass()}
              gap="6"
            >
              {children}
            </Flex>
          </Grid.Item>
        </Grid>
        <Signature title={title} url={postUrl} />
        <WebmentionBlogData date={date} postUrl={postUrl} subtitle={subtitle} />
      </article>
    </Layout>
  );
};

export default BlogLayout;
