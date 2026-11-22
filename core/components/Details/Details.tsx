import { extractChildren } from 'lib/utils/extractChildren';
import React, { useEffect } from 'react';

import Card from '../Card';
import { CollapsiblePanel, CollapsibleRoot } from './Details.styles';
import { DetailsProps } from './Details.types';
import Content from './DetailsContent';
import Summary from './DetailsSummary';
import { isElementOfTypeSummary } from './utils';

const Details = (props: DetailsProps) => {
  const { children, onOpenChange } = props;
  const [open, setOpen] = React.useState(false);
  const detailsRef = React.useRef<HTMLDetailsElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { match: SummaryComponent, rest } = extractChildren(
    children,
    isElementOfTypeSummary
  );

  const captureClick = (event: MouseEvent | KeyboardEvent) => {
    if (event.target instanceof Element) {
      // Prevent collapsing the details/summary panel when clicking on the content
      if (contentRef.current && contentRef.current.contains(event.target)) {
        event.preventDefault();
        return;
      }

      setOpen((prev) => !prev);
      // Hijack the close event to let the animation run its course before actually closing the detail panel
      if (detailsRef.current && detailsRef.current.hasAttribute('open')) {
        event.preventDefault();

        setTimeout(() => {
          detailsRef.current?.removeAttribute('open');
        }, 400);
      }
    }
  };

  useEffect(() => {
    const detailsElement = detailsRef.current;

    if (detailsElement) {
      detailsElement.addEventListener('click', captureClick);
    }

    return () => {
      detailsElement?.removeEventListener('click', captureClick);
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
  };

  return (
    <CollapsibleRoot
      render={(renderProps) => (
        <Card {...renderProps} css={{ width: '100%' }} data-card-details>
          {renderProps.children}
        </Card>
      )}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <details ref={detailsRef}>
        {SummaryComponent}
        <CollapsiblePanel ref={contentRef}>{rest}</CollapsiblePanel>
      </details>
    </CollapsibleRoot>
  );
};

Details.Summary = Summary;
Details.Content = Content;

export default Details;
