import { Box, css, Flex, Grid, Pill, Text } from '@maximeheckel/design-system';
import { format } from 'date-fns';
import React from 'react';
import Layout from '@core/layout';
import Seo from '@core/components/Seo';
import { Snippet } from 'types/post';
import Hero from '@core/components/Hero';
import { templateColumnsMedium } from 'styles/grid';

interface Props {
  children: React.ReactNode;
  frontMatter: Snippet;
}

const contentClass = css({
  padding: 'var(--space-5) 0px',
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
        <Grid gapX={4} templateColumns={templateColumnsMedium}>
          <Grid.Item col={2}>
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
          </Grid.Item>
          <Grid.Item col={2}>
            <Box className={contentClass()}>{children}</Box>
          </Grid.Item>
        </Grid>
      </article>
    </Layout>
  );
};

export default SnippetLayout;
