import {
  Anchor,
  Blockquote,
  EM,
  InlineCode,
  List,
  Strong,
  Text,
} from '@maximeheckel/design-system';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { ComponentProps, memo, useEffect, useMemo, useState } from 'react';

import Code from '../Code';

// Answers need Markdown primitives, not the article's interactive widget registry.
const components = {
  a: (props: ComponentProps<'a'>) => <Anchor external underline {...props} />,
  blockquote: Blockquote,
  code: InlineCode,
  em: (props: ComponentProps<'em'>) => <EM size="1" {...props} />,
  li: List.Item,
  ol: (props: ComponentProps<'ol'>) => <List variant="ordered" {...props} />,
  p: (props: ComponentProps<'p'>) => (
    <Text as="p" size="1" variant="secondary" {...props} />
  ),
  pre: Code,
  strong: (props: ComponentProps<'strong'>) => <Strong size="1" {...props} />,
  ul: (props: ComponentProps<'ul'>) => <List variant="unordered" {...props} />,
};

interface AnswerProps {
  text: string;
  onRender: () => void;
}

export const Answer = memo(({ text, onRender }: AnswerProps) => {
  const [mdx, setMdx] = useState<MDXRemoteSerializeResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!text) {
      setMdx(null);
      return;
    }

    void serialize(text, {
      mdxOptions: {
        format: 'md',
        development: process.env.NODE_ENV === 'development',
      },
    }).then(
      (result) => {
        if (!cancelled) setMdx(result);
      },
      () => {
        // Keep the last rendered answer if an incomplete chunk cannot compile.
      }
    );

    return () => {
      cancelled = true;
    };
  }, [text]);

  useEffect(() => {
    if (mdx) onRender();
  }, [mdx, onRender]);

  const rendered = useMemo(
    () => (mdx ? <MDXRemote {...mdx} components={components} /> : null),
    [mdx]
  );

  return text ? (
    <Text
      as="div"
      size="1"
      variant="secondary"
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        '> *': { marginBlock: 0 },
        li: {
          fontSize: 'var(--font-size-1)',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
          color: 'var(--text-secondary)',
        },
        'li + li': { marginTop: 'var(--space-2)' },
        'li > div[data-list-item]': {
          display: 'flex',
          alignItems: 'center',
          height: '1lh',
          flexShrink: 0,
          transform: 'none',
        },
        'li > div:not([data-list-item]) > p, blockquote > p': {
          marginBlock: 0,
        },
        'li > div:not([data-list-item]) > * + *, blockquote > * + *': {
          marginTop: 'var(--space-2)',
        },
      }}
    >
      {rendered}
    </Text>
  ) : null;
});
