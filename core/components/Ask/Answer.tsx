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
  em: EM,
  li: List.Item,
  ol: (props: ComponentProps<'ol'>) => <List variant="ordered" {...props} />,
  p: (props: ComponentProps<'p'>) => (
    <Text as="p" size="1" variant="secondary" {...props} />
  ),
  pre: Code,
  strong: Strong,
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
        li: {
          fontSize: 'var(--font-size-1)',
          color: 'var(--text-secondary)',
        },
      }}
    >
      {rendered}
    </Text>
  ) : null;
});
