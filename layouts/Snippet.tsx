import styled from '@emotion/styled';
import React from 'react';
import Layout from '@theme/layouts';
import Seo from '@theme/components/Seo';
import { MONTHS } from '@theme/constants';
import Flex from '@theme/components/Flex';
import Pill from '@theme/components/Pill';
import { MDXBody } from '@theme/components/MDX/MDX';
import { Snippet } from 'types/post';

interface Props {
  children: React.ReactNode;
  frontMatter: Snippet;
}

const SnippetLayout = ({ children, frontMatter }: Props) => {
  const { date, slug, title, description, language } = frontMatter;
  const progressBarTarget = React.createRef<HTMLDivElement>();
  const path = `/snippets/${slug}/`;
  const image = `/static/snippets/${slug}.png`;

  const headerProps = {
    search: true,
  };

  const parsedDate = new Date(date);

  return (
    <Layout footer={false} header={true} headerProps={headerProps}>
      <article className="h-entry">
        <Seo
          title={title}
          image={image}
          desc={description}
          path={path}
          date={date}
        />
        <FixPadding>
          <h2>{title}</h2>
          <Flex>
            <p>
              Created {MONTHS[parsedDate.getMonth()]} {parsedDate.getDate()}{' '}
              {parsedDate.getFullYear()}
            </p>
            <Pill color="#5184f9" text={language.toUpperCase()} />
          </Flex>
          <FixMargin id="foo">
            <MDXBody ref={progressBarTarget} maxWidth={880}>
              {children}
            </MDXBody>
          </FixMargin>
        </FixPadding>
      </article>
    </Layout>
  );
};

export default SnippetLayout;

const FixMargin = styled('div')`
  margin-top: -30px;
`;

const FixPadding = styled('div')`
  padding-top: 35px;

  p {
    color: var(--maximeheckel-colors-typeface-2);
    font-size: 14px;
    font-weight: 500;
  }
`;
