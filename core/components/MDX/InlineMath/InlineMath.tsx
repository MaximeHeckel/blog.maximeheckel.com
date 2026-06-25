import { InlineCode } from '@maximeheckel/design-system';
import katex from 'katex';
import { ReactNode } from 'react';

import { InlineMathRoot } from './InlineMath.styles';

interface InlineMathProps {
  block?: boolean;
  children: ReactNode;
}

const InlineMath = (props: InlineMathProps) => {
  const { block = false, children } = props;
  const latex = String(children).trim();
  const html = katex.renderToString(latex, {
    displayMode: false,
    throwOnError: false,
  });

  return (
    <InlineMathRoot as="span" block={block}>
      <InlineCode>
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </InlineCode>
    </InlineMathRoot>
  );
};

export default InlineMath;
