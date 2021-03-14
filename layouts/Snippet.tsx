import { css } from '@emotion/react';
import { format } from 'date-fns';
import React from 'react';
import Layout from '@theme/layout';
import Seo from '@theme/components/Seo';
import Flex from '@theme/components/Flex';
import Pill, { PillVariant } from '@theme/components/Pill';
import MDXBody from '@theme/components/MDX/MDX';
import { Snippet } from 'types/post';
import Grid from '@theme/components/Grid';
import Hero from '@theme/components/Hero';

interface Props {
  children: React.ReactNode;
  frontMatter: Snippet;
}

const SnippetLayout = ({ children, frontMatter }: Props) => {
  const { date, slug, title, description, language } = frontMatter;
  const path = `/snippets/${slug}/`;
  const image = `/static/snippets/${slug}.png`;

  const headerProps = {
    search: true,
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
        <Grid
          columns="var(--layout-medium)"
          columnGap={20}
          css={css`
            padding-top: 32px;

            > * {
              grid-column: 2;
            }
          `}
        >
          <Hero
            id="top"
            css={css`
              padding-top: 0px;
            `}
          >
            <Hero.Title
              className="p-name"
              data-testid={`project-title-${title}`}
            >
              {title}
            </Hero.Title>
            <Hero.Info>
              <Flex justifyContent="space-between">
                <p>
                  Created {format(new Date(Date.parse(date)), 'MMM dd yyyy')}
                </p>
                <Pill variant={PillVariant.INFO}>{language.toUpperCase()}</Pill>
              </Flex>
            </Hero.Info>
          </Hero>
          <MDXBody layout="medium">{children}</MDXBody>
        </Grid>
      </article>
    </Layout>
  );
};

export default SnippetLayout;
