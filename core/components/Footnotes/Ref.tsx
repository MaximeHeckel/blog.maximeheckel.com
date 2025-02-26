import React from 'react';

import * as S from './Footnotes.styles';

interface FootnoteRefProps {
  id: string;
}

const FootnoteRef = ({ id }: FootnoteRefProps) => (
  <S.FootnoteRef as="sup">
    <a id={`ref-${id}`} href={`#fn-${id}`}>
      {id}
    </a>
  </S.FootnoteRef>
);

export { FootnoteRef };
