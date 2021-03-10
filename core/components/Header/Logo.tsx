import Link from 'next/link';
import React from 'react';

export interface HeaderLogoProps {
  ['aria-label']: string;
  alt: string;
  style?: Record<string, string>;
}

export const Logo: React.FC<HeaderLogoProps> = (props) => {
  const child = props.children
    ? React.cloneElement(props.children as React.ReactElement<any>, {
        ...props,
        ['data-testid']: 'header-logo',
        ['aria-label']: props['aria-label'],
        alt: props.alt,
      })
    : null;

  return (
    <Link href="/" aria-label="Go back to article list">
      <a title="Go back to article list">{child}</a>
    </Link>
  );
};
