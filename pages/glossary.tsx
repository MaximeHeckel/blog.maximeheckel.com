import fs from 'fs';
import path from 'path';

import { Grid } from '@maximeheckel/design-system';
import type { GetStaticProps } from 'next';

import { BottomBlurGradientMask } from '@core/components/BottomBlurGradientMask';
import Footer from '@core/components/Footer';
import { Header } from '@core/components/Header';
import { Main } from '@core/components/Main';
import Seo from '@core/components/Seo';
import { GlossarySection, GlossaryTerm } from '@core/features/GlossarySection';

interface GlossaryProps {
  terms: GlossaryTerm[];
}

const GLOSSARY_PATH = path.join(process.cwd(), 'content', 'glossary.json');

const Glossary = (props: GlossaryProps) => {
  const { terms } = props;

  return (
    <Main>
      <Seo
        title="Glossary"
        desc="A glossary of technical terms mentioned across my blog posts."
        path="/glossary"
      />
      <Header />
      <Grid
        css={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          overflowX: 'clip',
          overflowY: 'visible',
          backgroundColor: 'var(--background)',
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 4,
          paddingTop: 236,
          paddingBottom: 96,
        }}
        gapX={2}
        templateColumns="1fr minmax(auto, 712px) 1fr"
      >
        <Grid.Item col={2}>
          <GlossarySection terms={terms} />
        </Grid.Item>
      </Grid>
      <BottomBlurGradientMask />
      <Footer />
    </Main>
  );
};

export default Glossary;

export const getStaticProps: GetStaticProps<GlossaryProps> = async () => {
  const fileContent = fs.readFileSync(GLOSSARY_PATH, 'utf8');
  const parsedTerms = JSON.parse(fileContent) as GlossaryTerm[];
  const terms = parsedTerms
    .filter((item) => item && typeof item.term === 'string')
    .map((item) => ({
      aliases: Array.isArray(item.aliases)
        ? item.aliases.filter((alias) => typeof alias === 'string')
        : [],
      definition:
        typeof item.definition === 'string' ? item.definition.trim() : '',
      kind: (item.kind === 'function' ? 'function' : 'other') as
        | 'function'
        | 'other',
      term: item.term.trim(),
    }))
    .filter((item) => item.term.length > 0)
    .sort((termA, termB) =>
      termA.term.localeCompare(termB.term, 'en', { sensitivity: 'base' })
    );

  return {
    props: {
      terms,
    },
  };
};
