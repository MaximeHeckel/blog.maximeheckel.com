import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';

const Tooltip = dynamic(() => import('@theme/components/Tooltip'), {
  ssr: false,
});

export interface HeaderLogoProps {
  ['aria-label']: string;
  alt: string;
  style?: Record<string, string>;
}

const LogoWrapper: React.FC<HeaderLogoProps> = (props) => {
  const child = props.children
    ? React.cloneElement(props.children as React.ReactElement<any>, {
        ...props,
        ['data-testid']: 'header-logo',
        ['aria-label']: props['aria-label'],
        alt: props.alt,
      })
    : null;

  return (
    <Tooltip id="hometooltip" tooltipText="Home">
      <Link href="/" aria-label="Home" aria-describedby="hometooltip">
        <a title="Home">{child}</a>
      </Link>
    </Tooltip>
  );
};

export { LogoWrapper };
