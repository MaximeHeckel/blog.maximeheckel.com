import { Box, css, Flex, Grid, Pill, Text } from '@maximeheckel/design-system';
import { format } from 'date-fns';
import React from 'react';
import Layout from '@theme/layout';
import Seo from '@theme/components/Seo';
import { Snippet } from 'types/post';
import Hero from '@theme/components/Hero';

interface Props {
  children: React.ReactNode;
  frontMatter: Snippet;
}

const contentClass = css({
  padding: 'var(--space-5) 0px',
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
        <Grid columns="medium" gapX={4}>
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
          <Box className={contentClass()}>{children}</Box>
        </Grid>
      </article>
    </Layout>
  );
};

export default SnippetLayout;
