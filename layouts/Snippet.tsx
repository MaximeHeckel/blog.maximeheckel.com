import { format } from 'date-fns';
import React from 'react';
import Layout from '@theme/layout';
import Seo from '@theme/components/Seo';
import Flex from '@theme/components/Flex';
import Pill from '@theme/components/Pill';
import { Snippet } from 'types/post';
import Grid from '@theme/components/Grid';
import Hero from '@theme/components/Hero';
import Text from '@theme/components/Typography';
import { css } from 'lib/stitches.config';

interface Props {
  children: React.ReactNode;
  frontMatter: Snippet;
}

const contentClass = css({
  padding: '20px 0px',
  gridColumn: '2',
  color: 'var(--maximeheckel-colors-typeface-secondary)',

  h2: {
    marginTop: '2em',
  },

  h3: {
    marginTop: '2em',
  },
});

const SnippetLayout = ({ children, frontMatter }: Props) => {
  const { date, slug, title, description, language } = frontMatter;
  const path = `/snippets/${slug}/`;
  const image = `/static/snippets/${slug}.png`;

  const headerProps = {
    title,
    offsetHeight: 200,
  };

  return (
    <Layout footer={false} header={true} headerProps={headerProps}>
      <Seo
        title={title}
        image={image}
        desc={description}
        path={path}
        date={date}
      />
      <article className="h-entry">
        <Grid columns="var(--layout-medium)" columnGap={20}>
          <Hero>
            <Hero.Title
              className="p-name"
              data-testid={`project-title-${title}`}
            >
              {title}
            </Hero.Title>
            <Hero.Info>
              <Flex justifyContent="space-between">
                <Text
                  as="p"
                  size="1"
                  variant="tertiary"
                  weight="3"
                  css={{ marginBottom: '0px' }}
                >
                  Created {format(new Date(Date.parse(date)), 'MMM dd yyyy')}
                </Text>
                <Pill variant="info">{language.toUpperCase()}</Pill>
              </Flex>
            </Hero.Info>
          </Hero>
          <div className={contentClass()}>{children}</div>
        </Grid>
      </article>
    </Layout>
  );
};

export default SnippetLayout;
