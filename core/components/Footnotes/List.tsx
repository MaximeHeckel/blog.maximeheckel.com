import { Box, Text, styled } from '@maximeheckel/design-system';
import React from 'react';

import { HR } from '../HR';
import * as S from './Footnotes.styles';

interface FootnotesProps {
  notes: Array<{
    id: string;
    content: React.ReactNode;
  }>;
}

const List = styled('ol', {
  counterReset: 'footnotes',
  listStyle: 'none',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  marginBottom: 0,

  '& li': {
    display: 'flex',
    alignItems: 'start',
    gap: 'var(--space-2)',
  },
});

const FootnotesList = ({ notes }: FootnotesProps) => {
  if (notes.length === 0) return null;

  return (
    <Box as="section" css={{ paddingTop: 'var(--space-8)' }}>
      <HR />
      <List>
        {notes.map((note) => (
          <li key={note.id} id={`fn-${note.id}`}>
            <S.FootnoteRef
              css={{
                marginTop: 4,
              }}
              id={note.id}
            >
              <a href={`#ref-${note.id}`}>{note.id}</a>
            </S.FootnoteRef>
            <Text as="span" size="2" weight="3">
              {note.content}
            </Text>
          </li>
        ))}
      </List>
    </Box>
  );
};

export { FootnotesList };
