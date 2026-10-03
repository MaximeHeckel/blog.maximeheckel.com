import { Anchor } from '@maximeheckel/design-system';
import Link from 'next/link';
import type { ComponentProps } from 'react';

import siteConfig from '../../../config/site';

export const AnswerLink = ({ href, ...props }: ComponentProps<'a'>) => {
  const origin =
    typeof window === 'undefined' ? siteConfig.url : window.location.origin;
  try {
    const url = new URL(
      href ?? '',
      typeof window === 'undefined' ? siteConfig.url : window.location.href
    );
    if (href && (url.origin === origin || url.origin === siteConfig.url)) {
      return (
        <Anchor
          {...props}
          as={Link}
          href={`${url.pathname}${url.search}${url.hash}`}
          underline
          target={undefined}
        />
      );
    }
  } catch {
    // Let the anchor handle incomplete URLs while Markdown is streaming.
  }
  return <Anchor {...props} href={href} external underline />;
};
